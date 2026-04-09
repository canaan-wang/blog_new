# 内存管理与性能

> JavaScript 自动内存管理并不意味着可以忽视内存问题。理解内存泄漏场景、掌握 Performance 工具，是编写高性能应用的基础。

---

## 一、内存生命周期

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  分配内存  │ → │  使用内存  │ → │  释放内存  │
└──────────┘    └──────────┘    └──────────┘
     │                │               │
     │                │               │
  变量声明         读写操作         垃圾回收
  对象创建         函数调用        (GC)
```

---

## 二、内存泄漏常见场景

### 2.1 意外的全局变量

```javascript
// ❌ 未声明变成全局
function leak() {
  leakedVar = "I'm global";  // 挂载到 window
}

// ❌ this 指向意外
function LeakyClass() {
  this.leaked = "Oops";  // 如果用 LeakyClass() 调用，this 是 window
}

// ✅ 严格模式防止
"use strict";
function safe() {
  leakedVar = 1;  // ReferenceError
}

// ✅ class 自动严格模式
class SafeClass {
  constructor() {
    this.safe = "OK";  // new 调用检查
  }
}
```

### 2.2 闭包陷阱

```javascript
// ❌ 闭包引用大对象
function createLeak() {
  const hugeData = new Array(1000000).fill("x");
  
  return {
    getSmallData() {
      return "small";
      // hugeData 无法回收，即使没用到！
    }
  };
}

// ✅ 只保留需要的数据
function createSafe() {
  const hugeData = new Array(1000000).fill("x");
  const result = process(hugeData);  // 提取结果
  
  return {
    getResult() {
      return result;  // 只引用小结果
    }
  };
}
```

### 2.3 定时器未清理

```javascript
// ❌ 组件卸载时未清理
class Component {
  constructor() {
    this.data = fetchData();
    
    setInterval(() => {
      console.log(this.data);  // 持续引用
    }, 1000);
  }
}

// ✅ 正确清理
class SafeComponent {
  constructor() {
    this.data = fetchData();
    this.intervalId = setInterval(() => {
      this.update();
    }, 1000);
  }
  
  destroy() {
    clearInterval(this.intervalId);
    this.data = null;
  }
}
```

### 2.4 DOM 引用

```javascript
// ❌ DOM 移除后仍有引用
const elements = {
  button: document.getElementById("btn")
};

// 用户操作后按钮被移除
elements.button.parentNode.removeChild(elements.button);
// 但 elements.button 还在引用，无法回收

// ✅ 及时清理
function removeButton() {
  elements.button.parentNode.removeChild(elements.button);
  elements.button = null;  // 解除引用
}
```

### 2.5 事件监听未移除

```javascript
// ❌ 添加监听但不移除
class Emitter {
  constructor() {
    this.events = {};
  }
  
  on(event, handler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
    // handler 和它的闭包一直被引用
  }
}

// ✅ 使用 WeakMap 或提供 off 方法
class SafeEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);
    
    // 返回取消订阅函数
    return () => this.off(event, handler);
  }
  
  off(event, handler) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
}

// 使用
const unsubscribe = emitter.on("event", handler);
// 清理时
unsubscribe();
```

### 2.6 WeakMap/WeakSet 的正确使用

```javascript
// ✅ 用 WeakMap 关联元数据
const metadata = new WeakMap();

function process(element) {
  metadata.set(element, { processed: true, timestamp: Date.now() });
  // 当 element 不再被其他地方引用，metadata 中的条目自动消失
}

// ❌ 不要用 WeakMap 当普通 Map
const cache = new WeakMap();  // 键必须是对象

cache.set("key", value);  // ❌ TypeError
```

---

## 三、性能优化技巧

### 3.1 对象池

```javascript
// ❌ 频繁创建销毁
function gameLoop() {
  for (let i = 0; i < 100; i++) {
    const bullet = new Bullet();  // GC 压力
    bullets.push(bullet);
  }
}

// ✅ 对象池
class BulletPool {
  constructor(size = 100) {
    this.pool = [];
    this.active = [];
    
    for (let i = 0; i < size; i++) {
      this.pool.push(new Bullet());
    }
  }
  
  acquire() {
    let bullet = this.pool.pop();
    if (!bullet) {
      bullet = new Bullet();  // 池耗尽时新建
    }
    this.active.push(bullet);
    bullet.reset();
    return bullet;
  }
  
  release(bullet) {
    const index = this.active.indexOf(bullet);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(bullet);
    }
  }
}
```

### 3.2 字符串拼接优化

```javascript
// ❌ 大量字符串拼接
let html = "";
for (let i = 0; i < 10000; i++) {
  html += "<div>" + items[i] + "</div>";
}

// ✅ 数组 join
const parts = [];
for (let i = 0; i < 10000; i++) {
  parts.push(`<div>${items[i]}</div>`);
}
const html = parts.join("");

// 或现代引擎优化后，+ 也可以接受
```

### 3.3 防抖与节流

```javascript
// 防抖：延迟执行，重置计时
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：固定频率
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 使用
window.addEventListener(
  "scroll",
  throttle(() => {
    console.log("Throttled scroll");
  }, 100)
);
```

### 3.4 虚拟列表

```javascript
// 只渲染可视区域
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.buffer = 5;  // 缓冲区
    
    this.renderViewport();
    this.bindEvents();
  }
  
  renderViewport() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + this.buffer,
      this.items.length
    );
    
    // 只渲染可视区域
    const visibleItems = this.items.slice(startIndex, endIndex);
    this.container.innerHTML = visibleItems
      .map((item, i) => `<div style="top:${(startIndex + i) * this.itemHeight}px">${item}</div>`)
      .join("");
  }
}
```

---

## 四、性能分析工具

### 4.1 Chrome DevTools

```javascript
// 1. Performance 面板
// 记录性能，分析长任务

// 2. Memory 面板
// - Heap snapshot：堆快照
// - Allocation instrumentation on timeline：分配时间线
// - Allocation sampling：分配采样

// 3. 标记时间线
console.time("operation");
doSomething();
console.timeEnd("operation");  // "operation: 123.45ms"

// 4. Performance mark
performance.mark("start");
doSomething();
performance.mark("end");
performance.measure("operation", "start", "end");
console.log(performance.getEntriesByName("operation"));
```

### 4.2 内存分析示例

```javascript
// 检测内存泄漏
let before = 0;

function measureMemory() {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize;
    const delta = used - before;
    console.log(`Memory: ${(used / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Delta: ${(delta / 1024).toFixed(2)} KB`);
    before = used;
  }
}

// 测试
measureMemory();
// 执行可疑代码
measureMemory();  // 对比差异
```

### 4.3 Node.js 内存分析

```bash
# 查看 GC 日志
node --trace-gc script.js

# 堆快照
node --heapsnapshot-near-heap-limit=3 script.js

# 使用 heapdump 模块
npm install heapdump
```

```javascript
const heapdump = require("heapdump");

// 生成快照
heapdump.writeSnapshot((err, filename) => {
  console.log("Snapshot:", filename);
});

// Chrome DevTools 中加载 .heapsnapshot 分析
```

---

## 五、总结速查

```javascript
// 内存泄漏检查清单
// □ 是否有未声明的全局变量
// □ 定时器/interval 是否清理
// □ 事件监听是否移除
// □ DOM 引用是否清理
// □ 闭包是否引用不必要的大对象

// 性能优化清单
// □ 使用对象池复用对象
// □ 大数据集使用虚拟滚动
// □ 高频事件使用防抖/节流
// □ 避免频繁的 DOM 操作
// □ 使用 requestAnimationFrame 做动画

// 分析工具
// Chrome DevTools Performance/Memory
// console.time/timeEnd
// performance.mark/measure
// Node.js --trace-gc, heapdump
```

---

**相关文章**：
- 上一篇：[V8 引擎浅析](./js-v8-engine.md)
- 下一篇：[函数式编程入门](./js-functional-programming.md)

**参考**：
- [MDN: 内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_management)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
