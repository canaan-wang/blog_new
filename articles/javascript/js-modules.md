# 模块化发展史

> 从全局变量到 ES Modules，JavaScript 模块化经历了漫长演进。理解 CommonJS、AMD、UMD 和 ESM 的差异，是掌握现代工程化的基础。

---

## 一、无模块化的黑暗时代

### 1.1 全局变量污染

```javascript
// a.js
var name = "module A";

// b.js
var name = "module B";  // 覆盖了 a.js 的 name！

// main.js
console.log(name);  // "module B"（不可预测）
```

### 1.2 命名空间模式

```javascript
// 用对象作为命名空间
var ModuleA = {
  name: "module A",
  getName: function() {
    return this.name;
  }
};

var ModuleB = {
  name: "module B",
  getName: function() {
    return this.name;
  }
};

console.log(ModuleA.getName());  // "module A"
console.log(ModuleB.getName());  // "module B"
```

### 1.3 IIFE 模块

```javascript
// 立即执行函数表达式
var Counter = (function() {
  // 私有变量
  var count = 0;
  
  // 公开 API
  return {
    increment: function() {
      return ++count;
    },
    decrement: function() {
      return --count;
    },
    getValue: function() {
      return count;
    }
  };
})();

Counter.increment();
console.log(Counter.getValue());  // 1
```

---

## 二、CommonJS（CJS）

### 2.1 基本语法

```javascript
// math.js - 导出
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };
// 或
exports.add = add;
exports.subtract = subtract;

// main.js - 导入
const math = require("./math.js");
console.log(math.add(2, 3));  // 5

// 解构导入
const { add, subtract } = require("./math.js");
```

### 2.2 特点

| 特性 | 说明 |
|------|------|
| 运行时加载 | `require()` 在代码运行时才加载 |
| 同步加载 | 模块加载是同步的 |
| 值拷贝 | 导出的是值的拷贝 |
| 缓存 | 模块首次加载后会被缓存 |
| 环境 | Node.js 原生支持 |

### 2.3 module.exports vs exports

```javascript
// exports 是 module.exports 的引用
console.log(exports === module.exports);  // true

// 直接赋值给 exports 会断开连接！
exports = { foo: "bar" };  // ❌ 错误，不再指向 module.exports

// 正确做法
module.exports = { foo: "bar" };  // ✅
// 或
exports.foo = "bar";  // ✅ 修改引用的对象
```

### 2.4 循环依赖处理

```javascript
// a.js
console.log("a starting");
exports.done = false;
const b = require("./b.js");
console.log("in a, b.done =", b.done);
exports.done = true;
console.log("a done");

// b.js
console.log("b starting");
exports.done = false;
const a = require("./a.js");  // 返回 a 的未完成 exports
console.log("in b, a.done =", a.done);
exports.done = true;
console.log("b done");

// main.js
console.log("main starting");
const a = require("./a.js");
const b = require("./b.js");
console.log("in main, a.done =", a.done, "b.done =", b.done);

// 输出：
// main starting
// a starting
// b starting
// in b, a.done = false
// b done
// in a, b.done = true
// a done
// in main, a.done = true b.done = true
```

---

## 三、AMD（Asynchronous Module Definition）

### 3.1 RequireJS 示例

```javascript
// math.js
define(function() {
  function add(a, b) {
    return a + b;
  }
  
  return {
    add: add
  };
});

// 带依赖的模块
define(["./math"], function(math) {
  function calculate() {
    return math.add(1, 2);
  }
  
  return {
    calculate: calculate
  };
});

// main.js
require(["calculator"], function(calculator) {
  console.log(calculator.calculate());
});
```

### 3.2 特点

- **异步加载**：适合浏览器环境
- **依赖前置**：在定义模块时就声明依赖
- **动态加载**：`require()` 可在代码中动态加载

---

## 四、UMD（Universal Module Definition）

### 4.1 通用模块格式

```javascript
// UMD 模式：同时兼容 CJS、AMD 和全局变量
(function(root, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    // AMD
    define([], factory);
  } else {
    // 全局变量
    root.myModule = factory();
  }
}(typeof self !== "undefined" ? self : this, function() {
  // 模块代码
  function hello() {
    return "Hello, UMD!";
  }
  
  return { hello: hello };
}));
```

### 4.2 现代简化版

```javascript
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" 
    ? module.exports = factory() 
    : typeof define === "function" && define.amd 
      ? define(factory) 
      : (global = global || self, global.myLib = factory());
}(this, function() {
  "use strict";
  // 库代码...
}));
```

---

## 五、ES Modules（ESM）

### 5.1 基本语法

```javascript
// math.js - 命名导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 默认导出
export default function multiply(a, b) {
  return a * b;
}

// 聚合导出
export * from "./other.js";
export { foo, bar } from "./utils.js";
```

```javascript
// main.js - 导入
// 默认导入
import multiply from "./math.js";

// 命名导入
import { add, subtract } from "./math.js";

// 全部导入
import * as math from "./math.js";

// 同时导入默认和命名
import multiply, { add, subtract } from "./math.js";

// 重命名导入
import { add as sum } from "./math.js";

// 副作用导入（只执行，不导入值）
import "./polyfill.js";
```

### 5.2 静态结构

```javascript
// ✅ 静态导入（编译时确定）
import { foo } from "./module.js";

// ❌ 动态路径（不允许）
import foo from getModuleName();

// ✅ 动态导入（ES2020）
const module = await import("./module.js");

// 条件动态导入
if (condition) {
  const { helper } = await import("./helper.js");
}

// 根据路径动态导入
const lang = "zh";
const messages = await import(`./i18n/${lang}.js`);
```

### 5.3 导入导出特性

```javascript
// 导出时重命名
export { foo as default, bar as helper };

// 重新导出
export { default } from "./other.js";
export * from "./utils.js";

// 导入元数据
console.log(import.meta.url);  // 当前模块的 URL

// Node.js 环境
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## 六、CJS vs ESM 对比

| 特性 | CommonJS | ES Modules |
|------|----------|------------|
| 加载时机 | 运行时 | 编译时 |
| 加载方式 | 同步 | 异步 |
| 导出内容 | 值的拷贝 | 值的引用（只读） |
| 顶层 this | `module.exports` | `undefined` |
| 动态导入 | `require()` | `import()` |
| 条件导入 | ✅ 支持 | ❌ 顶层不支持 |
| 循环依赖 | 部分支持 | 完整支持 |
| 浏览器支持 | 需打包 | 原生支持 |

### 6.1 值的拷贝 vs 引用

```javascript
// CommonJS：值的拷贝
// counter.js
let count = 0;
module.exports = {
  count: count,  // 导出值的拷贝
  increment: () => ++count
};

// main.js
const counter = require("./counter.js");
console.log(counter.count);     // 0
counter.increment();
console.log(counter.count);     // 0（仍然是0，拷贝的值）
```

```javascript
// ES Modules：值的引用
// counter.js
export let count = 0;
export function increment() {
  ++count;
}

// main.js
import { count, increment } from "./counter.js";
console.log(count);     // 0
increment();
console.log(count);     // 1（实时更新）
```

---

## 七、Tree Shaking

### 7.1 什么是 Tree Shaking

```javascript
// utils.js
export function used() {
  return "I'm used!";
}

export function unused() {
  return "I'm never imported!";
}

// main.js
import { used } from "./utils.js";
console.log(used());

// Tree Shaking 后，unused 函数不会被打包
```

### 7.2 有效 Tree Shaking 的条件

```javascript
// ✅ ESM 静态结构使 Tree Shaking 可能
import { specificFunction } from "library";

// ❌ CommonJS 难以 Tree Shake
const library = require("library");
library.specificFunction();

// ✅ 副作用标注（package.json）
{
  "name": "my-lib",
  "sideEffects": false
  // 或
  "sideEffects": ["*.css", "./src/polyfill.js"]
}
```

---

## 八、现代项目的模块策略

### 8.1 选择模块格式

```javascript
// 新项目：优先 ESM
// package.json
{
  "type": "module",  // 默认使用 ESM
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}

// 双模式支持
// index.mjs（ESM 入口）
export { foo } from "./lib.js";

// index.cjs（CJS 入口）
module.exports = require("./lib.cjs");
```

### 8.2 常见配置

```javascript
// Node.js ESM 与 CJS 互操作
// 在 ESM 中导入 CJS
import pkg from "commonjs-package";
const { foo } = pkg;

// 在 CJS 中导入 ESM（Node 12+）
(async () => {
  const { foo } = await import("esm-package");
})();
```

---

## 九、总结速查

```javascript
// CommonJS
const module = require("./module");
module.exports = { foo };
exports.foo = foo;

// AMD
define(["deps"], function(deps) { return {}; });
require(["deps"], function(deps) { });

// ESM
import defaultExport from "module";
import { named } from "module";
import * as namespace from "module";
export const foo = 1;
export default foo;
export { foo as bar };
export * from "module";

// 动态导入
const module = await import("./module.js");

// 现代项目推荐
// 1. 新项目使用 ESM（type: "module"）
// 2. 库同时提供 ESM 和 CJS 入口
// 3. 利用 Tree Shaking 减少包体积
```

---

**相关文章**：
- 上一篇：[Promise 与异步编程](./js-promise-async.md)
- 下一篇：[Symbol 与 BigInt](./js-symbol-bigint.md)

**参考**：
- [MDN: JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [Node.js Modules](https://nodejs.org/api/modules.html)
- [ES Modules Spec](https://tc39.es/ecma262/#sec-modules)
