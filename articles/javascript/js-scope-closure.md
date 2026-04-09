# 作用域与闭包

> 作用域决定了变量的可访问范围，闭包则让函数"记住"了它的诞生环境。这两个概念是理解 JavaScript 执行机制的核心。

---

## 一、作用域基础

### 1.1 什么是作用域

**作用域（Scope）** 定义了变量和函数的可访问范围，控制变量的可见性与生命周期。

JavaScript 采用**词法作用域（Lexical Scoping）**，即作用域由**代码书写位置**决定，而非执行位置。

```javascript
const global = "我是全局变量";

function outer() {
  const outerVar = "我是外部变量";
  
  function inner() {
    const innerVar = "我是内部变量";
    console.log(global);    // ✅ 可以访问
    console.log(outerVar);  // ✅ 可以访问
    console.log(innerVar);  // ✅ 可以访问
  }
  
  inner();
}

outer();
```

### 1.2 作用域的三种类型

```
┌─────────────────────────────────────┐
│           全局作用域                 │
│  ┌─────────────────────────────┐    │
│  │        函数作用域            │    │
│  │  ┌─────────────────────┐    │    │
│  │  │     块级作用域       │    │    │
│  │  │   （ES6 let/const）  │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## 二、全局作用域

### 2.1 全局变量

在代码最外层或函数内**省略 var/let/const** 声明的变量会成为全局变量。

```javascript
// 方式1：最外层声明
const GLOBAL_A = "全局A";
var globalB = "全局B";

function fn() {
  // 方式2：隐式创建（严格模式报错）
  implicitGlobal = "我是隐式全局变量";  // ❌ 避免！
}

// 方式3：挂载到 window（浏览器）
window.globalC = "全局C";
```

### 2.2 全局对象

```javascript
// 浏览器环境
console.log(window === this);  // true（全局作用域中）
console.log(window.parseInt);  // 全局函数

// Node.js 环境
global.process;    // 全局对象
global.console;    // 控制台

// ES2020 标准写法（通用）
console.log(globalThis);
```

> ⚠️ **警告**：全局变量容易造成命名冲突和内存泄漏，应尽量避免。

---

## 三、函数作用域

### 3.1 函数创建的作用域

函数内部声明的变量**外部无法访问**。

```javascript
function secretKeeper() {
  const secret = "这是一个秘密";
  
  function reveal() {
    return secret;  // 内部可以访问
  }
  
  return reveal;
}

const getSecret = secretKeeper();
console.log(getSecret());  // "这是一个秘密"
console.log(secret);       // ❌ ReferenceError: secret is not defined
```

### 3.2 作用域链

当访问变量时，JavaScript 会沿**作用域链**由内向外查找。

```javascript
const a = "全局a";

function first() {
  const b = "first的b";
  
  function second() {
    const c = "second的c";
    
    function third() {
      console.log(a);  // 全局 → 找到
      console.log(b);  // first → 找到
      console.log(c);  // second → 找到
    }
    
    third();
  }
  
  second();
}

first();
```

**查找顺序**：third → second → first → 全局

---

## 四、块级作用域（ES6+）

### 4.1 let 与 const 的块级特性

```javascript
if (true) {
  let blockVar = "块级变量";
  const BLOCK_CONST = "块级常量";
}

console.log(blockVar);    // ❌ ReferenceError
console.log(BLOCK_CONST); // ❌ ReferenceError
```

### 4.2 var vs let vs const 对比

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（初始化为undefined） | 是（暂时性死区） | 是（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 声明时必须初始化 | 否 | 否 | 是 |

```javascript
// 变量提升差异
console.log(varVar);    // undefined
console.log(letVar);    // ❌ ReferenceError: Cannot access before initialization

var varVar = "var";
let letVar = "let";
```

### 4.3 暂时性死区（Temporal Dead Zone）

```javascript
{
  // TDZ 开始
  console.log(value);  // ❌ ReferenceError
  
  let value = "hello"; // TDZ 结束
  console.log(value);  // ✅ "hello"
}
```

> 💡 **最佳实践**：默认使用 `const`，需要重新赋值时用 `let`，**避免使用 `var`**。

---

## 五、执行上下文与作用域的关系

### 5.1 执行上下文（Execution Context）

执行上下文是代码执行时的环境，包含：
- **变量对象（VO）**：存储变量、函数声明
- **作用域链（Scope Chain）**：当前作用域 + 所有父级作用域
- **this 指向**

### 5.2 执行上下文的生命周期

```javascript
// 1. 创建阶段（编译）
function example() {
  console.log(a);  // undefined（变量提升）
  console.log(b);  // ❌ TDZ 错误
  
  var a = 1;
  let b = 2;
}

// 2. 执行阶段（运行）
example();
```

### 5.3 调用栈（Call Stack）

```javascript
function first() {
  console.log("first");
  second();
}

function second() {
  console.log("second");
  third();
}

function third() {
  console.log("third");
  console.trace();  // 打印调用栈
}

first();

/* 调用栈（后进先出）：
   third
   second
   first
   (anonymous)  // 全局
*/
```

---

## 六、闭包（Closure）

### 6.1 什么是闭包

**闭包**是指函数能够**记住并访问**其词法作用域，即使函数在其词法作用域之外执行。

```javascript
function createCounter() {
  let count = 0;  // 私有变量
  
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getValue() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment());  // 1
console.log(counter.increment());  // 2
console.log(counter.getValue());   // 2
console.log(count);                // ❌ ReferenceError（外部无法访问）
```

### 6.2 闭包的本质

```javascript
function outer() {
  const value = "outer的值";
  
  function inner() {
    console.log(value);  // 闭包：inner 记住了 outer 的作用域
  }
  
  return inner;
}

const fn = outer();  // outer 执行完毕，本该销毁 value
fn();                // 但 value 仍然存活！这就是闭包
```

**内存示意**：

```
outer() 执行完：
┌─────────┐        ┌─────────────────┐
│   fn    │───────→│  inner 函数对象  │
└─────────┘        │  [[Scopes]]:    │
                   │    → outer 的 VO │
                   │       (包含 value)│
                   └─────────────────┘
```

### 6.3 经典闭包陷阱

```javascript
// ❌ 错误：所有函数共享同一个 i
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // 3, 3, 3
  }, 100);
}

// ✅ 方案1：使用 let（每次迭代新作用域）
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);  // 0, 1, 2
  }, 100);
}

// ✅ 方案2：IIFE 创建独立作用域
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j);  // 0, 1, 2
    }, 100);
  })(i);
}
```

---

## 七、闭包的实际应用

### 7.1 模块化模式（Module Pattern）

```javascript
const Calculator = (function() {
  // 私有变量
  let result = 0;
  
  // 私有方法
  function validate(num) {
    return typeof num === "number" && !isNaN(num);
  }
  
  // 公开 API
  return {
    add(num) {
      if (validate(num)) result += num;
      return this;
    },
    subtract(num) {
      if (validate(num)) result -= num;
      return this;
    },
    getResult() {
      return result;
    },
    reset() {
      result = 0;
      return this;
    }
  };
})();

Calculator.add(5).subtract(2);
console.log(Calculator.getResult());  // 3
console.log(Calculator.result);       // undefined（私有）
```

### 7.2 函数柯里化

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3));  // 6
console.log(curriedSum(1, 2)(3));  // 6
```

### 7.3 单例模式

```javascript
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    return {
      data: [],
      add(item) {
        this.data.push(item);
      }
    };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const a = Singleton.getInstance();
const b = Singleton.getInstance();
console.log(a === b);  // true
```

### 7.4 防抖与节流

```javascript
// 防抖：延迟执行，重置计时
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
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

// 使用
window.addEventListener(
  "resize",
  debounce(() => console.log("resized"), 300)
);
```

---

## 八、闭包与内存

### 8.1 内存泄漏风险

```javascript
function createHeavyClosure() {
  const hugeData = new Array(1000000).fill("x");
  
  return function() {
    console.log("我引用了 hugeData，它无法被回收");
  };
}

const leak = createHeavyClosure();
// hugeData 一直占用内存，即使我们只用到了 closure 的一小部分

// ✅ 优化：只保留需要的数据
function createLightClosure() {
  const hugeData = new Array(1000000).fill("x");
  const smallData = hugeData.slice(0, 10);  // 只保留需要的
  
  return function() {
    console.log(smallData);  // 只引用小数据
  };
}
```

### 8.2 释放闭包引用

```javascript
let closure = createClosure();
// 使用...
closure = null;  // 解除引用，允许垃圾回收
```

---

## 九、总结速查

```javascript
// 作用域规则
var    // 函数作用域，变量提升
let    // 块级作用域，TDZ
const  // 块级作用域，TDZ，不可重新赋值

// 闭包的核心：函数 + 词法环境
function outer() {
  const x = 1;
  return () => x;  // 闭包
}

// 常见应用
// 1. 数据私有化
// 2. 模块化
// 3. 柯里化
// 4. 防抖节流
// 5. 缓存/记忆化

// 注意事项
// 1. 避免循环中的闭包陷阱（用 let 或 IIFE）
// 2. 注意内存管理（及时释放不需要的引用）
```

---

**相关文章**：
- 上一篇：[JS 数据类型全解](./js-data-types.md)
- 下一篇：[this 指向详解](./js-this-binding.md)

**参考**：
- [MDN: 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS)
