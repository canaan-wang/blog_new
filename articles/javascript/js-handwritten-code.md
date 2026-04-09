# 手写源码系列

> 通过手写实现 JavaScript 核心 API，深入理解其工作原理。这是检验 JS 基础的最佳方式。

---

## 一、Promise

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
    onFulfilled = typeof onFulfilled === "function" 
      ? onFulfilled 
      : value => value;
    onRejected = typeof onRejected === "function"
      ? onRejected
      : error => { throw error };
    
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === "fulfilled") {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else if (this.state === "rejected") {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    
    return promise2;
  }
  
  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError("Chaining cycle detected"));
    }
    
    if (x !== null && (typeof x === "object" || typeof x === "function")) {
      let called;
      try {
        const then = x.then;
        if (typeof then === "function") {
          then.call(x, y => {
            if (called) return;
            called = true;
            this.resolvePromise(promise2, y, resolve, reject);
          }, r => {
            if (called) return;
            called = true;
            reject(r);
          });
        } else {
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
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

## 二、new 操作符

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建空对象，原型指向 Constructor.prototype
  const obj = Object.create(Constructor.prototype);
  
  // 2. 执行构造函数，this 绑定到新对象
  const result = Constructor.apply(obj, args);
  
  // 3. 如果构造函数返回对象，则返回该对象，否则返回新对象
  return (result !== null && (typeof result === "object" || typeof result === "function")) 
    ? result 
    : obj;
}

// 使用
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  return `Hello, ${this.name}`;
};

const p = myNew(Person, "Alice");
console.log(p.name);      // "Alice"
console.log(p.greet());   // "Hello, Alice"
```

---

## 三、call / apply / bind

```javascript
// call
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

// apply
Function.prototype.myApply = function(context, args) {
  context = context || globalThis;
  const fnSymbol = Symbol("fn");
  context[fnSymbol] = this;
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

// bind
Function.prototype.myBind = function(context, ...bindArgs) {
  const self = this;
  
  function boundFunction(...callArgs) {
    // 判断是否通过 new 调用
    const isNew = this instanceof boundFunction;
    return self.apply(
      isNew ? this : context,
      [...bindArgs, ...callArgs]
    );
  }
  
  // 维护原型链
  boundFunction.prototype = Object.create(self.prototype);
  
  return boundFunction;
};
```

---

## 四、debounce / throttle

```javascript
// 防抖：延迟执行，重置计时
function debounce(fn, delay, immediate = false) {
  let timer;
  
  return function(...args) {
    const callNow = immediate && !timer;
    
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delay);
    
    if (callNow) fn.apply(this, args);
  };
}

// 节流：固定频率执行
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

// 节流（leading 和 trailing 选项）
function throttleAdvanced(fn, limit, options = {}) {
  const { leading = true, trailing = true } = options;
  let lastFunc;
  let lastRan;
  
  return function(...args) {
    if (!lastRan) {
      if (leading) fn.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (trailing && Date.now() - lastRan >= limit) {
          fn.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
```

---

## 五、深拷贝

```javascript
function deepClone(obj, map = new WeakMap()) {
  // 基本类型直接返回
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // 处理正则
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    const clone = [];
    map.set(obj, clone);
    obj.forEach((item, index) => {
      clone[index] = deepClone(item, map);
    });
    return clone;
  }
  
  // 处理对象
  const clone = Object.create(Object.getPrototypeOf(obj));
  map.set(obj, clone);
  
  for (const key of Reflect.ownKeys(obj)) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor) {
      Object.defineProperty(clone, key, {
        ...descriptor,
        value: deepClone(descriptor.value, map)
      });
    }
  }
  
  return clone;
}

// 使用
const obj = {
  a: 1,
  b: { c: 2 },
  d: [1, 2, 3],
  e: new Date(),
  f: /abc/g
};

const cloned = deepClone(obj);
console.log(cloned.b === obj.b);  // false
```

---

## 六、Array 方法

```javascript
// forEach
Array.prototype.myForEach = function(callback, thisArg) {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      callback.call(thisArg, this[i], i, this);
    }
  }
};

// map
Array.prototype.myMap = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }
  return result;
};

// filter
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// reduce
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;
  
  if (arguments.length < 2) {
    accumulator = this[0];
    startIndex = 1;
  }
  
  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      accumulator = callback(accumulator, this[i], i, this);
    }
  }
  
  return accumulator;
};

// flat
Array.prototype.myFlat = function(depth = 1) {
  if (depth <= 0) return this.slice();
  
  return this.reduce((flat, item) => {
    return flat.concat(
      Array.isArray(item) ? item.myFlat(depth - 1) : item
    );
  }, []);
};
```

---

## 七、EventEmitter

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    return this.on(event, onceWrapper);
  }
  
  off(event, listener) {
    if (!this.events[event]) return this;
    
    if (!listener) {
      delete this.events[event];
      return this;
    }
    
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return false;
    
    this.events[event].forEach(listener => {
      listener.apply(this, args);
    });
    return true;
  }
  
  listenerCount(event) {
    return this.events[event]?.length || 0;
  }
  
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}
```

---

## 八、JSON.stringify / JSON.parse（简化版）

```javascript
// 简化版 JSON.stringify
function jsonStringify(obj) {
  const type = typeof obj;
  
  if (type !== "object" || obj === null) {
    if (type === "string") return `"${obj}"`;
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    const items = obj.map(item => jsonStringify(item));
    return `[${items.join(",")}]`;
  }
  
  const pairs = Object.entries(obj)
    .filter(([key, value]) => value !== undefined && typeof value !== "function")
    .map(([key, value]) => `"${key}":${jsonStringify(value)}`);
  
  return `{${pairs.join(",")}}`;
}

// 使用
jsonStringify({ a: 1, b: "hello", c: [1, 2, 3] });
// {"a":1,"b":"hello","c":[1,2,3]}
```

---

## 九、Ajax（Promise 版）

```javascript
function request({ method = "GET", url, data = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(xhr.statusText));
        }
      }
    };
    
    xhr.onerror = () => reject(new Error("Network Error"));
    xhr.send(data);
  });
}

// GET
request({ url: "/api/users" }).then(console.log);

// POST
request({
  method: "POST",
  url: "/api/users",
  data: JSON.stringify({ name: "Alice" }),
  headers: { "Content-Type": "application/json" }
});
```

---

## 十、总结速查

```javascript
// Promise：状态机 + 回调队列
// new：Object.create + apply
// call/apply：context[fn]()
// bind：返回新函数，处理 new 调用
// debounce：clearTimeout + setTimeout
// throttle：标志位控制
// 深拷贝：递归 + WeakMap 处理循环
// Array 方法：遍历 + callback
// EventEmitter：events 对象 + 数组
// Ajax：XMLHttpRequest + Promise
```

---

**相关文章**：
- 上一篇：[设计模式（JS 版）](./js-design-patterns.md)
- 下一篇：[DOM 操作最佳实践](./js-dom-operations.md)

**参考**：
- [Promise A+ 规范](https://promisesaplus.com/)
- [MDN Web API](https://developer.mozilla.org/zh-CN/docs/Web/API)
