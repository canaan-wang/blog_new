# 事件机制深度解析

> 事件是 JavaScript 与页面交互的桥梁。理解事件冒泡、捕获、委托，以及自定义事件，是前端开发的必备技能。

---

## 一、事件流三阶段

```
┌─────────────────────────────────────┐
│           捕获阶段 (Capturing)       │  从 window 到目标
│    1 ──→ 2 ──→ 3 ──→ 4 ──→ 5        │
│    ↓    ↓    ↓    ↓    ↓            │
│   html  body  div  div  button      │
│                           ↑         │
│                      目标阶段        │  目标元素
│                           ↓         │
│   html  body  div  div  button      │
│    ↑    ↑    ↑    ↑    ↑            │
│    1 ←──2 ←──3 ←──4 ←──5            │
│           冒泡阶段 (Bubbling)        │  从目标到 window
└─────────────────────────────────────┘
```

---

## 二、addEventListener

### 2.1 参数详解

```javascript
element.addEventListener(
  "click",           // 事件类型（不带 on）
  handler,           // 回调函数
  {
    capture: false,  // true = 捕获阶段，false = 冒泡阶段（默认）
    once: false,     // true = 只执行一次
    passive: false,  // true = 不会调用 preventDefault()（优化滚动）
    signal: AbortSignal  // 用于取消监听
  }
);
```

### 2.2 捕获 vs 冒泡

```javascript
const parent = document.getElementById("parent");
const child = document.getElementById("child");

// 捕获阶段
parent.addEventListener("click", () => {
  console.log("parent capture");
}, true);  // capture = true

// 目标阶段（child）
child.addEventListener("click", () => {
  console.log("child target");
});

// 冒泡阶段
parent.addEventListener("click", () => {
  console.log("parent bubble");
});  // capture = false（默认）

// 点击 child：
// parent capture → child target → parent bubble
```

---

## 三、事件对象

### 3.1 常用属性

```javascript
element.addEventListener("click", (event) => {
  event.target;       // 触发事件的元素
  event.currentTarget; // 绑定监听器的元素（等于 this）
  event.type;         // 事件类型："click"
  event.timeStamp;    // 事件发生时间戳
  
  // 鼠标事件
  event.clientX;      // 相对于视口
  event.pageX;        // 相对于文档（含滚动）
  event.offsetX;      // 相对于目标元素
  
  // 键盘事件
  event.key;          // 按键值："Enter"
  event.code;         // 物理键码："KeyA"
  event.ctrlKey;      // 是否按住 Ctrl
  event.preventDefault();   // 阻止默认行为
  event.stopPropagation();  // 阻止事件传播
});
```

### 3.2 阻止默认与传播

```javascript
// 阻止默认行为
form.addEventListener("submit", (e) => {
  e.preventDefault();  // 阻止表单提交
  // 自定义提交逻辑
});

link.addEventListener("click", (e) => {
  e.preventDefault();  // 阻止跳转
});

// 阻止事件传播
child.addEventListener("click", (e) => {
  e.stopPropagation();  // 不再向上冒泡
  console.log("child clicked");
});

// 阻止同一元素上的其他监听器
element.addEventListener("click", (e) => {
  e.stopImmediatePropagation();  // 阻止后续所有监听器
});
```

---

## 四、事件委托

### 4.1 原理与实现

```javascript
// ❌ 每个按钮单独绑定
buttons.forEach(btn => {
  btn.addEventListener("click", () => console.log(btn.id));
});

// ✅ 委托给父容器
document.getElementById("toolbar").addEventListener("click", (e) => {
  const button = e.target.closest("[data-action]");
  if (!button) return;
  
  const action = button.dataset.action;
  
  switch (action) {
    case "save": saveDocument(); break;
    case "open": openDocument(); break;
    case "delete": deleteDocument(); break;
  }
});
```

### 4.2 动态元素处理

```javascript
// 列表项动态添加/删除
const list = document.getElementById("list");

// ✅ 委托监听，自动处理新增项
list.addEventListener("click", (e) => {
  const item = e.target.closest(".list-item");
  if (!item) return;
  
  const id = item.dataset.id;
  
  if (e.target.matches(".delete-btn")) {
    deleteItem(id);
  } else if (e.target.matches(".edit-btn")) {
    editItem(id);
  } else {
    selectItem(id);
  }
});

// 动态添加新项
function addItem(data) {
  const item = document.createElement("div");
  item.className = "list-item";
  item.dataset.id = data.id;
  item.innerHTML = `
    <span>${data.name}</span>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  `;
  list.appendChild(item);  // 自动有事件监听
}
```

---

## 五、自定义事件

### 5.1 创建与触发自定义事件

```javascript
// 创建自定义事件
const event = new CustomEvent("userLogin", {
  detail: {            // 自定义数据
    userId: 123,
    username: "Alice"
  },
  bubbles: true,       // 是否冒泡
  cancelable: true     // 是否可取消
});

// 触发自定义事件
document.dispatchEvent(event);

// 监听自定义事件
document.addEventListener("userLogin", (e) => {
  console.log("User logged in:", e.detail.username);
});
```

### 5.2 应用示例

```javascript
// 组件间通信
class TaskManager {
  constructor() {
    this.element = document.createElement("div");
  }
  
  addTask(task) {
    // 添加任务逻辑
    
    // 通知其他组件
    this.element.dispatchEvent(new CustomEvent("taskAdded", {
      detail: { task },
      bubbles: true
    }));
  }
  
  completeTask(taskId) {
    // 完成任务逻辑
    
    this.element.dispatchEvent(new CustomEvent("taskCompleted", {
      detail: { taskId },
      bubbles: true
    }));
  }
}

// 其他组件监听
document.addEventListener("taskCompleted", (e) => {
  showNotification(`Task ${e.detail.taskId} completed!`);
  updateStats();
});
```

---

## 六、常用事件类型

### 6.1 输入事件

```javascript
// input：值改变立即触发
input.addEventListener("input", (e) => {
  console.log(e.target.value);
});

// change：失焦后值改变触发
select.addEventListener("change", (e) => {
  console.log(e.target.value);
});

// compositionstart/end：中文输入法
input.addEventListener("compositionstart", () => {
  this.isComposing = true;
});
input.addEventListener("compositionend", (e) => {
  this.isComposing = false;
  handleInput(e.target.value);
});
```

### 6.2 鼠标/触摸事件

```javascript
// 鼠标事件
mousedown/mouseup/mousemove/mouseleave/mouseenter
click/dblclick/contextmenu

// 触摸事件（移动端）
touchstart/touchmove/touchend/touchcancel

// 指针事件（统一鼠标和触摸）
pointerdown/pointermove/pointerup

// 使用示例：拖拽
element.addEventListener("pointerdown", (e) => {
  const startX = e.clientX;
  const startY = e.clientY;
  
  const handleMove = (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    element.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  
  const handleUp = () => {
    document.removeEventListener("pointermove", handleMove);
    document.removeEventListener("pointerup", handleUp);
  };
  
  document.addEventListener("pointermove", handleMove);
  document.addEventListener("pointerup", handleUp);
});
```

### 6.3 滚动/Resize 事件

```javascript
// 防抖处理 scroll
window.addEventListener("scroll", debounce(() => {
  console.log("Scroll position:", window.scrollY);
}, 100));

// Resize Observer（替代 resize 事件）
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log("Size changed:", width, height);
  }
});
resizeObserver.observe(element);
```

---

## 七、总结速查

```javascript
// 事件监听
addEventListener(type, handler, options);
addEventListener(type, handler, useCapture);  // 旧版

// options
{ capture: false, once: false, passive: false, signal }

// 事件流
// 捕获 → 目标 → 冒泡

// 阻止默认与传播
e.preventDefault();       // 阻止默认行为
e.stopPropagation();      // 阻止冒泡/捕获
e.stopImmediatePropagation();  // 阻止所有后续监听

// 事件委托
document.addEventListener("click", (e) => {
  if (e.target.closest(".item")) {
    // handle
  }
});

// 自定义事件
new CustomEvent("name", { detail, bubbles, cancelable });
element.dispatchEvent(event);

// 事件属性
e.target        // 触发元素
e.currentTarget // 绑定元素
e.detail        // 自定义数据
```

---

**相关文章**：
- 上一篇：[DOM 操作最佳实践](./js-dom-operations.md)
- 下一篇：[浏览器存储方案](./js-storage.md)

**参考**：
- [MDN: 事件](https://developer.mozilla.org/zh-CN/docs/Web/Events)
- [Event Spec](https://dom.spec.whatwg.org/#events)
