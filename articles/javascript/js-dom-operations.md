# DOM 操作最佳实践

> DOM 操作是前端性能的关键瓶颈。理解重排重绘、DocumentFragment、事件委托等技术，能让你的页面丝般顺滑。

---

## 一、DOM 性能瓶颈

### 1.1 为什么 DOM 慢

```javascript
// DOM 是浏览器中的 C++ 对象，与 JS 有桥梁成本
for (let i = 0; i < 1000; i++) {
  document.body.innerHTML += `<div>${i}</div>`;  // ❌ 1000次重排！
}

// 每次修改 DOM 可能触发：
// 1. 重排（Reflow）：计算几何属性
// 2. 重绘（Repaint）：绘制像素
// 3. 合成（Composite）：GPU 层合成
```

### 1.2 重排 vs 重绘

| 操作 | 影响 | 示例 |
|------|------|------|
| **重排** | 重新计算布局，代价最高 | width, height, margin, padding, left, top |
| **重绘** | 重新绘制外观，代价中等 | color, background, visibility, border-radius |
| **合成** | GPU 层变换，代价最低 | transform, opacity |

**触发重排的操作**：

```javascript
// 读取布局属性（强制同步布局）
const width = element.offsetWidth;  // 触发重排

// 修改布局属性
element.style.width = "100px";      // 触发重排

// 添加/删除 DOM 元素
parent.appendChild(child);          // 触发重排
```

---

## 二、批量 DOM 操作

### 2.1 DocumentFragment

```javascript
// ❌ 每次插入都触发重排
for (let i = 0; i < 1000; i++) {
  const div = document.createElement("div");
  div.textContent = `Item ${i}`;
  container.appendChild(div);  // 1000次重排！
}

// ✅ 使用 DocumentFragment，只触发 1 次重排
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement("div");
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);
}
container.appendChild(fragment);  // 一次性插入
```

### 2.2 克隆节点

```javascript
// ✅ 模板克隆
const template = document.createElement("div");
template.innerHTML = `
  <div class="item">
    <span class="title"></span>
    <span class="desc"></span>
  </div>
`;

const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const clone = template.cloneNode(true);
  clone.querySelector(".title").textContent = `Title ${i}`;
  clone.querySelector(".desc").textContent = `Description ${i}`;
  fragment.appendChild(clone);
}
container.appendChild(fragment);
```

### 2.3 innerHTML vs createElement

```javascript
// innerHTML：解析字符串，适合大量静态内容
const html = items.map(item => `
  <div class="item" data-id="${item.id}">
    <span>${item.name}</span>
  </div>
`).join("");
container.innerHTML = html;

// createElement：动态操作，适合需要后续交互的元素
const div = document.createElement("div");
div.className = "item";
div.dataset.id = item.id;
div.addEventListener("click", handleClick);
```

---

## 三、减少重排

### 3.1 读写分离

```javascript
// ❌ 交替读写（强制多次重排）
for (let i = 0; i < elements.length; i++) {
  const height = elements[i].offsetHeight;  // 读（触发重排）
  elements[i].style.height = height * 2 + "px";  // 写（触发重排）
}

// ✅ 先读后写（批处理）
const heights = elements.map(el => el.offsetHeight);  // 批量读
heights.forEach((height, i) => {
  elements[i].style.height = height * 2 + "px";  // 批量写
});
```

### 3.2 离线操作

```javascript
// ✅ display:none 的元素不会触发重排
const parent = element.parentNode;
const next = element.nextSibling;
parent.removeChild(element);  // 从 DOM 移除

// 大量修改
modifyElement(element);

parent.insertBefore(element, next);  // 插回原位

// ✅ 或使用 CSS 隐藏
const originalDisplay = element.style.display;
element.style.display = "none";
// 批量修改...
element.style.display = originalDisplay;
```

### 3.3 使用 transform 代替位置属性

```javascript
// ❌ 触发重排
box.style.left = "100px";
box.style.top = "100px";

// ✅ GPU 加速，不触发重排
box.style.transform = "translate(100px, 100px)";

// 配合 will-change（谨慎使用）
box.style.willChange = "transform";
// 动画结束后清除
box.addEventListener("transitionend", () => {
  box.style.willChange = "auto";
});
```

---

## 四、事件委托

### 4.1 原理

```javascript
// ❌ 每个元素绑定事件（1000个监听器）
document.querySelectorAll(".item").forEach(item => {
  item.addEventListener("click", handleClick);
});

// ✅ 事件委托（1个监听器）
document.getElementById("list").addEventListener("click", (e) => {
  const item = e.target.closest(".item");
  if (item) {
    handleClick.call(item, e);
  }
});
```

### 4.2 实现通用委托

```javascript
function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  });
}

// 使用
delegate(document.getElementById("list"), "click", ".item", function(e) {
  console.log("Clicked:", this.dataset.id);
});
```

---

## 五、虚拟滚动（Virtual Scrolling）

```javascript
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.buffer = 5;
    
    // 创建占位元素撑开滚动条
    this.spacer = document.createElement("div");
    this.spacer.style.height = items.length * itemHeight + "px";
    container.appendChild(this.spacer);
    
    this.visibleItems = [];
    this.container.addEventListener("scroll", () => this.render());
    this.render();
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const startIdx = Math.floor(scrollTop / this.itemHeight);
    const endIdx = Math.min(
      startIdx + this.visibleCount + this.buffer,
      this.items.length
    );
    
    // 清理不在视野的元素
    this.visibleItems.forEach(el => el.remove());
    this.visibleItems = [];
    
    // 渲染可见区域
    for (let i = startIdx; i < endIdx; i++) {
      const el = this.createItem(this.items[i], i);
      el.style.position = "absolute";
      el.style.top = i * this.itemHeight + "px";
      el.style.height = this.itemHeight + "px";
      this.container.appendChild(el);
      this.visibleItems.push(el);
    }
  }
  
  createItem(data, index) {
    const div = document.createElement("div");
    div.textContent = data;
    return div;
  }
}
```

---

## 六、Intersection Observer

```javascript
// ✅ 懒加载图片
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove("lazy");
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll("img.lazy").forEach(img => {
  imageObserver.observe(img);
});

// ✅ 无限滚动
const sentinel = document.querySelector("#sentinel");
const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMoreData();
  }
});
scrollObserver.observe(sentinel);
```

---

## 七、requestAnimationFrame

```javascript
// ✅ 平滑动画
function animate(element, targetX) {
  const startX = parseInt(element.style.left) || 0;
  const diff = targetX - startX;
  const duration = 300;
  const startTime = performance.now();
  
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 缓动函数
    const ease = 1 - Math.pow(1 - progress, 3);
    
    element.style.transform = `translateX(${startX + diff * ease}px)`;
    
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}

// ✅ 批量 DOM 操作分批处理
function batchProcess(items, batchSize = 10) {
  let index = 0;
  
  function processBatch() {
    const batch = items.slice(index, index + batchSize);
    
    batch.forEach(item => {
      // 处理每个元素
      process(item);
    });
    
    index += batchSize;
    
    if (index < items.length) {
      requestAnimationFrame(processBatch);
    }
  }
  
  requestAnimationFrame(processBatch);
}
```

---

## 八、总结速查

```javascript
// DOM 操作最佳实践

// 1. 批量插入使用 DocumentFragment
const fragment = document.createDocumentFragment();
// ... append to fragment
container.appendChild(fragment);

// 2. 离线修改（克隆/移除后再修改）
const clone = element.cloneNode(true);
// ... modify clone
parent.replaceChild(clone, element);

// 3. 读写分离（先读后写）
const styles = elements.map(el => ({
  width: el.offsetWidth,
  height: el.offsetHeight
}));
// ... then write

// 4. 事件委托
document.addEventListener("click", (e) => {
  if (e.target.matches(".item")) {
    // handle
  }
});

// 5. 使用 transform 代替位置属性
element.style.transform = "translate3d(x, y, z)";

// 6. 懒加载图片
const observer = new IntersectionObserver(callback);
observer.observe(image);

// 7. 虚拟列表处理大量数据
// 只渲染可视区域

// 8. requestAnimationFrame 做动画
requestAnimationFrame(step);
```

---

**相关文章**：
- 上一篇：[手写源码系列](./js-handwritten-code.md)
- 下一篇：[事件机制深度解析](./js-event-system.md)
