# 事件循环机制

> JavaScript 是单线程语言，事件循环（Event Loop）是其处理异步任务的核心机制。理解宏任务与微任务的执行顺序，是写出高性能异步代码的基础。

---

## 一、为什么需要事件循环

### 1.1 JavaScript 的单线程本质

```javascript
// 如果 JS 是多线程的
// 线程A：读取 DOM 节点
// 线程B：删除该 DOM 节点
// → 冲突！

// 单线程确保同一时间只执行一个任务
console.log("A");
console.log("B");
console.log("C");
// 永远按顺序输出 A → B → C
```

### 1.2 异步的必要性

```javascript
// ❌ 同步网络请求会阻塞页面
const data = fetchSync("/api/data");  // 页面卡死等待...

// ✅ 异步不会阻塞
fetch("/api/data").then(data => {
  console.log("获取成功");
});
console.log("继续执行");  // 立即输出，不等待
```

---

## 二、执行模型核心组件

### 2.1 三大核心结构

```
┌─────────────────────────────────────────────────────────────┐
│                        调用栈（Call Stack）                   │
│                    后进先出（LIFO），执行同步代码              │
└───────────────────────────┬─────────────────────────────────┘
                            │ 遇到异步任务
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Web APIs（浏览器提供）                 │
│    setTimeout、DOM 事件、AJAX、fetch、requestAnimationFrame   │
└───────────────────────────┬─────────────────────────────────┘
                            │ 异步任务完成
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      任务队列（Task Queue）                   │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │   宏任务队列     │    │   微任务队列     │                 │
│  │  Macrotask      │    │   Microtask     │                 │
│  │                 │    │                 │                 │
│  │  setTimeout     │    │  Promise.then   │                 │
│  │  setInterval    │    │  MutationObserver│                 │
│  │  I/O            │    │  queueMicrotask │                 │
│  │  UI rendering   │    │  await（隐式）   │                 │
│  └─────────────────┘    └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 事件循环流程

```
1. 执行同步代码（调用栈）
2. 调用栈清空后，检查微任务队列
3. 执行所有微任务（直到微任务队列为空）
4. 执行一个宏任务
5. 回到步骤 2
```

---

## 三、宏任务（Macrotask）

### 3.1 常见的宏任务

| 来源 | 示例 |
|------|------|
| 定时器 | `setTimeout`、`setInterval` |
| I/O | 文件读写、网络请求回调 |
| UI 渲染 | `requestAnimationFrame` |
| 用户交互 | 点击、滚动事件回调 |
| script | 整个 `<script>` 标签的执行 |

### 3.2 setTimeout 的延迟并非精确

```javascript
console.log("Start");

setTimeout(() => {
  console.log("Timeout 0ms");
}, 0);

console.log("End");

// 输出：Start → End → Timeout 0ms
// 即使延迟设为 0，也要等同步代码执行完
```

### 3.3 setTimeout 的最小延迟

```javascript
// HTML5 规范要求最小延迟为 4ms（嵌套层级超过 5 层时）
setTimeout(fn, 1);   // 实际可能 4ms+
setTimeout(fn, 0);   // 实际可能 4ms+

// 需要更快的异步执行？用微任务
Promise.resolve().then(fn);  // 在微任务中执行
```

---

## 四、微任务（Microtask）

### 4.1 常见的微任务

| 来源 | 示例 |
|------|------|
| Promise | `Promise.then/catch/finally` |
| async/await | `await` 后面的代码 |
| MutationObserver | DOM 变化观察 |
| queueMicrotask | 显式创建微任务 |

### 4.2 微任务优先级示例

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => {
  console.log("3");
});

console.log("4");

// 输出：1 → 4 → 3 → 2
// 解释：同步(1,4) → 微任务(3) → 宏任务(2)
```

### 4.3 微任务递归问题

```javascript
// ❌ 微任务中创建微任务会导致"饿死"宏任务
function loop() {
  Promise.resolve().then(loop);
}
loop();
// 宏任务（包括 UI 渲染）永远得不到执行

// ✅ 需要让出时间片时使用宏任务
function betterLoop() {
  setTimeout(betterLoop, 0);
}
```

---

## 五、完整执行示例分析

### 5.1 经典面试题解析

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => {
    console.log("3");
  });
}, 0);

Promise.resolve().then(() => {
  console.log("4");
  setTimeout(() => {
    console.log("5");
  }, 0);
});

console.log("6");

// 输出：1 → 6 → 4 → 2 → 3 → 5
```

**执行过程分解**：

```
第1轮：
  同步：1, 6
  微任务队列：[Promise.then(4)]
  宏任务队列：[setTimeout(2)]

第2轮（执行微任务）：
  输出：4
  新增宏任务：[setTimeout(2), setTimeout(5)]

第3轮（执行宏任务 setTimeout(2)）：
  输出：2
  新增微任务：[Promise.then(3)]

第4轮（执行微任务）：
  输出：3

第5轮（执行宏任务 setTimeout(5)）：
  输出：5
```

### 5.2 async/await 执行顺序

```javascript
async function async1() {
  console.log("async1 start");
  await async2();  // 等待 async2 的 Promise
  console.log("async1 end");  // 进入微任务队列
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

async1();

new Promise(resolve => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise2");
});

console.log("script end");

// 输出：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

**await 的底层行为**：

```javascript
// await x 等价于
Promise.resolve(x).then(() => {
  // await 后面的代码
});
```

---

## 六、浏览器 vs Node.js

### 6.1 Node.js 的事件循环阶段

```
┌───────────────────────────┐
│        timers 阶段         │  setTimeout/setInterval
├───────────────────────────┤
│    pending callbacks       │  系统操作回调
├───────────────────────────┤
│   idle, prepare（内部）    │
├───────────────────────────┤
│         poll 阶段          │  获取新的 I/O 事件
├───────────────────────────┤
│        check 阶段          │  setImmediate
├───────────────────────────┤
│    close callbacks         │  socket.on('close', ...)
└───────────────────────────┘

每个阶段之间执行微任务队列
```

### 6.2 关键差异

```javascript
// setImmediate vs setTimeout
setImmediate(() => console.log("immediate"));
setTimeout(() => console.log("timeout"), 0);

// Node.js：immediate 可能在 timeout 之前
// 浏览器：无 setImmediate，只有 setTimeout

// process.nextTick（Node.js 特有）
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));

// 输出：nextTick → promise
// nextTick 优先级高于微任务，可能"饿死"事件循环
```

---

## 七、requestAnimationFrame

### 7.1 渲染时机

```javascript
// 在下一次重绘前执行
function animate() {
  // 更新动画
  element.style.transform = `translateX(${x}px)`;
  
  // 继续下一帧
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

### 7.2 rAF 的位置

```
宏任务：script → setTimeout → ...
       ↓
     微任务清空
       ↓
  requestAnimationFrame
       ↓
     重绘/回流
       ↓
    下一个宏任务
```

---

## 八、常见陷阱与性能

### 8.1 阻塞主线程

```javascript
// ❌ 长时间计算阻塞 UI
function heavyComputation() {
  for (let i = 0; i < 1e9; i++) {}  // 页面卡死
}

// ✅ 分片执行，让出时间片
function chunkedComputation(n, chunk = 1000000) {
  let i = 0;
  
  function processChunk() {
    const end = Math.min(i + chunk, n);
    for (; i < end; i++) {
      // 处理数据
    }
    
    if (i < n) {
      setTimeout(processChunk, 0);  // 让出时间片
    }
  }
  
  processChunk();
}

// ✅ 使用 Web Worker
const worker = new Worker("worker.js");
worker.postMessage({ data: largeData });
worker.onmessage = (e) => {
  console.log("计算完成:", e.data);
};
```

### 8.2 Promise 的同步性

```javascript
console.log("A");

new Promise(resolve => {
  console.log("B");  // 同步执行！
  resolve();
}).then(() => {
  console.log("C");  // 微任务
});

console.log("D");

// 输出：A → B → D → C
```

### 8.3 微任务优先级过高

```javascript
// ❌ 按钮点击无响应
button.addEventListener("click", () => {
  Promise.resolve().then(() => {
    // 大量微任务...
    while (condition) {
      Promise.resolve().then(process);
    }
  });
});

// ✅ 使用 setTimeout 分批
button.addEventListener("click", () => {
  function processBatch() {
    // 处理一批
    if (condition) {
      setTimeout(processBatch, 0);  // 让 UI 有机会更新
    }
  }
  processBatch();
});
```

---

## 九、总结速查

```javascript
// 执行优先级：
// 同步代码 > 微任务 > 宏任务 > 渲染 > 下一个事件循环

console.log("同步");

Promise.resolve().then(() => {
  console.log("微任务");
});

setTimeout(() => {
  console.log("宏任务");
}, 0);

// 输出：同步 → 微任务 → 宏任务

// 微任务来源：
// - Promise.then/catch/finally
// - async/await
// - queueMicrotask()
// - MutationObserver

// 宏任务来源：
// - setTimeout/setInterval
// - I/O 操作
// - UI 事件
// - requestAnimationFrame

// 实用函数：让出主线程
function yieldToMain() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

// 使用
async function processLargeArray(items) {
  for (const item of items) {
    process(item);
    if (needToYield()) {
      await yieldToMain();  // 让 UI 更新
    }
  }
}
```

---

**相关文章**：
- 上一篇：[原型与继承](./js-prototype-inheritance.md)
- 下一篇：[解构与展开运算符](./js-destructuring-spread.md)

**参考**：
- [MDN: 并发模型与事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop)
- [JavaScript.info: Event Loop](https://javascript.info/event-loop)
- [Node.js 事件循环](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
