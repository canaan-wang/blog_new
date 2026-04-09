# Promise 与异步编程

> Promise 是 JavaScript 异步编程的基石。理解其状态机、链式调用、错误处理，以及 async/await 语法糖，是掌握现代异步代码的必经之路。

---

## 一、Promise 基础

### 1.1 为什么需要 Promise

```javascript
// ❌ 回调地狱（Callback Hell）
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        console.log(d);
      });
    });
  });
});

// ✅ Promise 链式调用
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => getMoreData(c))
  .then(d => console.log(d));
```

### 1.2 Promise 的三种状态

```javascript
const promise = new Promise((resolve, reject) => {
  // pending（待定）：初始状态
  
  if (success) {
    resolve(value);    // fulfilled（已成功）
  } else {
    reject(error);     // rejected（已拒绝）
  }
});

// 状态一旦确定，不可改变
const p = new Promise((resolve) => {
  resolve(1);
  resolve(2);  // 无效，状态已经是 fulfilled
});
```

**状态流转图**：

```
         new Promise
              │
              ▼
          ┌───────┐
          │pending│
          └───┬───┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌────────┐        ┌─────────┐
│fulfilled│        │rejected │
└────────┘        └─────────┘
    │                   │
    ▼                   ▼
   .then()           .catch()
```

---

## 二、Promise 基础用法

### 2.1 创建 Promise

```javascript
const fetchUser = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.5;
    
    if (success) {
      resolve({ id: 1, name: "Alice" });
    } else {
      reject(new Error("Failed to fetch user"));
    }
  }, 1000);
});
```

### 2.2 then / catch / finally

```javascript
fetchUser
  .then(user => {
    console.log("Got user:", user);
    return user.id;
  })
  .then(id => {
    console.log("User ID:", id);
  })
  .catch(error => {
    console.error("Error:", error.message);
  })
  .finally(() => {
    console.log("Cleanup code here");  // 无论成功失败都执行
  });
```

### 2.3 then 的返回值

```javascript
Promise.resolve(1)
  .then(value => {
    console.log(value);  // 1
    return value * 2;    // 返回普通值
  })
  .then(value => {
    console.log(value);  // 2
    return Promise.resolve(value * 2);  // 返回 Promise
  })
  .then(value => {
    console.log(value);  // 4
    throw new Error("Oops");  // 抛出错误
  })
  .catch(error => {
    console.log(error.message);  // "Oops"
    return "Recovered";
  })
  .then(value => {
    console.log(value);  // "Recovered"
  });
```

---

## 三、Promise 静态方法

### 3.1 Promise.resolve / Promise.reject

```javascript
// 快速创建成功/失败的 Promise
const success = Promise.resolve(42);
const failure = Promise.reject(new Error("Failed"));

// 自动包装返回值
const p = Promise.resolve({ data: [] });
```

### 3.2 Promise.all

```javascript
// 所有 Promise 都成功才成功，一个失败就全部失败
const urls = ["/api/a", "/api/b", "/api/c"];

Promise.all(urls.map(url => fetch(url)))
  .then(responses => {
    console.log("All succeeded:", responses);
  })
  .catch(error => {
    console.log("One failed:", error);
  });

// 带错误处理的 all
Promise.all(
  urls.map(url => 
    fetch(url).catch(err => ({ error: err, url }))
  )
).then(results => {
  // 即使某些请求失败，也能得到所有结果
  const successes = results.filter(r => !r.error);
  const failures = results.filter(r => r.error);
});
```

### 3.3 Promise.allSettled（ES2020）

```javascript
// 等待所有 Promise 完成，无论成功失败
Promise.allSettled([
  Promise.resolve("success"),
  Promise.reject("error"),
  Promise.resolve("another success")
]).then(results => {
  console.log(results);
  // [
  //   { status: "fulfilled", value: "success" },
  //   { status: "rejected", reason: "error" },
  //   { status: "fulfilled", value: "another success" }
  // ]
});
```

### 3.4 Promise.race

```javascript
// 返回最快完成的 Promise
Promise.race([
  fetch("/api/data"),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Timeout")), 5000)
  )
]).then(response => {
  console.log("Got response in time");
}).catch(error => {
  console.log("Request timed out");
});
```

### 3.5 Promise.any（ES2021）

```javascript
// 返回第一个成功的 Promise，全部失败才失败
Promise.any([
  fetch("/api/primary"),
  fetch("/api/backup1"),
  fetch("/api/backup2")
]).then(response => {
  console.log("First successful response");
}).catch(error => {
  // AggregateError: All promises were rejected
  console.log(error.errors);
});
```

---

## 四、错误处理最佳实践

### 4.1 catch 的位置

```javascript
// ❌ 在每个 then 后都加 catch
fetchUser()
  .then(user => getOrders(user), err => handleError(err))
  .then(orders => processOrders(orders), err => handleError(err));

// ✅ 统一在最后 catch（除非需要特殊处理）
fetchUser()
  .then(user => getOrders(user))
  .then(orders => processOrders(orders))
  .catch(error => {
    // 捕获链中任何位置的错误
    console.error("Operation failed:", error);
  });
```

### 4.2 错误恢复

```javascript
fetchUser()
  .catch(error => {
    console.log("Using cached user");
    return getCachedUser();  // 返回默认值恢复
  })
  .then(user => {
    // 继续执行，user 可能是 fetch 的或缓存的
  });
```

### 4.3 全局未捕获错误

```javascript
// Node.js
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

// 浏览器
window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled Rejection:", event.reason);
});
```

---

## 五、async/await

### 5.1 基本语法

```javascript
// ❌ Promise 链
function getUserData(userId) {
  return fetchUser(userId)
    .then(user => fetchOrders(user.id))
    .then(orders => ({ user, orders }));
}

// ✅ async/await
async function getUserData(userId) {
  const user = await fetchUser(userId);
  const orders = await fetchOrders(user.id);
  return { user, orders };
}
```

### 5.2 错误处理

```javascript
// try/catch
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;  // 重新抛出或返回默认值
  }
}

// 同时捕获多个
async function fetchMultiple() {
  try {
    const [users, orders] = await Promise.all([
      fetchUsers(),
      fetchOrders()
    ]);
    return { users, orders };
  } catch (error) {
    console.error("One of the requests failed");
  }
}
```

### 5.3 并行执行

```javascript
// ❌ 串行执行（慢）
async function sequential() {
  const a = await fetchA();  // 1s
  const b = await fetchB();  // 1s
  return [a, b];  // 总共 2s
}

// ✅ 并行执行（快）
async function parallel() {
  const [a, b] = await Promise.all([
    fetchA(),  // 同时开始
    fetchB()
  ]);
  return [a, b];  // 总共 1s
}

// ✅ 更现代的写法
async function parallel2() {
  const aPromise = fetchA();
  const bPromise = fetchB();
  return [await aPromise, await bPromise];
}
```

### 5.4 async/await 的陷阱

```javascript
// ❌ 在 forEach 中使用 await（不会等待）
async function processArray(array) {
  array.forEach(async (item) => {
    await processItem(item);  // 不会等待！
  });
  console.log("Done?");  // 实际还没完成
}

// ✅ 使用 for...of
async function processArray(array) {
  for (const item of array) {
    await processItem(item);  // 顺序执行
  }
  console.log("Done!");
}

// ✅ 并行处理
async function processArrayParallel(array) {
  await Promise.all(array.map(item => processItem(item)));
  console.log("Done!");
}

// ✅ 控制并发数
async function processWithLimit(array, limit = 5) {
  const results = [];
  const executing = [];
  
  for (const item of array) {
    const p = processItem(item);
    results.push(p);
    
    if (array.length >= limit) {
      executing.push(p);
      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(e => e === p), 1);
      }
    }
  }
  
  return Promise.all(results);
}
```

---

## 六、手写 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const fulfilledCallback = () => {
        try {
          const result = onFulfilled ? onFulfilled(this.value) : this.value;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      const rejectedCallback = () => {
        try {
          const result = onRejected ? onRejected(this.reason) : this.reason;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      if (this.state === "fulfilled") {
        fulfilledCallback();
      } else if (this.state === "rejected") {
        rejectedCallback();
      } else {
        this.onFulfilledCallbacks.push(fulfilledCallback);
        this.onRejectedCallbacks.push(rejectedCallback);
      }
    });
  }
  
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }
  
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
}
```

---

## 七、总结速查

```javascript
// 创建 Promise
new Promise((resolve, reject) => {
  // 异步操作
});

// 链式调用
promise
  .then(value => { /* 成功 */ })
  .catch(error => { /* 失败 */ })
  .finally(() => { /* 清理 */ });

// 静态方法
Promise.all([p1, p2, p3]);        // 全部成功
Promise.allSettled([p1, p2]);     // 全部完成
Promise.race([p1, p2]);           // 最快完成
Promise.any([p1, p2]);            // 首个成功
Promise.resolve(value);           // 成功 Promise
Promise.reject(error);            // 失败 Promise

// async/await
async function fn() {
  try {
    const result = await promise;
    return result;
  } catch (error) {
    // 处理错误
  }
}

// 最佳实践
// 1. 统一在最后 catch，除非需要特殊处理
// 2. 并行请求用 Promise.all
// 3. 不要在 forEach 中使用 await
// 4. 提供错误恢复机制
```

---

**相关文章**：
- 上一篇：[解构与展开运算符](./js-destructuring-spread.md)
- 下一篇：[模块化发展史](./js-modules.md)

**参考**：
- [MDN: Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [Promise A+ 规范](https://promisesaplus.com/)
