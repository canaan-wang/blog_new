# JS 数据类型全解

> 理解数据类型是掌握 JavaScript 的第一步。本文深入剖析七种原始类型与两种引用类型，揭示类型转换的隐藏规则与常见陷阱。

---

## 一、类型概览

JavaScript 是**动态弱类型**语言，共有 **9 种**数据类型：

| 类别 | 类型 | 说明 |
|------|------|------|
| **原始类型** (Primitive) | `undefined` | 未定义 |
| | `null` | 空值（历史遗留的 object 类型标签）|
| | `boolean` | 布尔值 |
| | `number` | 数字（双精度浮点数）|
| | `bigint` | 大整数（ES2020+）|
| | `string` | 字符串 |
| | `symbol` | 符号（ES6+，唯一标识符）|
| **引用类型** (Reference) | `object` | 对象（含 Array、Function、Date 等）|

> 💡 **记忆口诀**：`undefined`、`null`、`boolean`、`number`、`bigint`、`string`、`symbol` + `object`

---

## 二、原始类型详解

### 2.1 undefined

表示**未定义**——变量已声明但未被赋值。

```javascript
let a;
console.log(a);           // undefined
console.log(typeof a);    // "undefined"
```

**常见场景**：

```javascript
// 1. 变量未初始化
let x;

// 2. 函数无返回值
function fn() {}
console.log(fn());        // undefined

// 3. 对象不存在的属性
const obj = {};
console.log(obj.name);    // undefined

// 4. 函数参数未传值
function greet(name) {
  console.log(name);      // undefined
}
greet();
```

> ⚠️ 注意：`undefined` 不是关键字，可以被赋值（严格模式下会报错），建议用 `void 0` 获取安全的 undefined。

---

### 2.2 null

表示**空值**——一个"没有值"的**有意的空对象引用**。

```javascript
let user = null;          // 明确表示 user 目前没有值
console.log(typeof null); // "object"（历史 bug，永不会修复）
```

**undefined vs null**：

| 对比项 | undefined | null |
|--------|-----------|------|
| 含义 | 未定义（意外） | 空值（故意） |
| typeof | "undefined" | "object" |
| 转换为数字 | NaN | 0 |

```javascript
console.log(undefined == null);   // true（宽松相等）
console.log(undefined === null);  // false（严格相等，推荐）
```

> ✅ 最佳实践：清空对象引用时用 `null`，让垃圾回收器知道可以回收。

---

### 2.3 boolean

只有两个值：`true` 和 `false`。

** falsy 值**（转换为 false）：

```javascript
false
0、-0、0n（BigInt 零）
""（空字符串）
null
undefined
NaN
document.all（浏览器历史遗留）
```

**truthy 值**：除上述 falsy 值外，**所有值**都是 truthy，包括：

```javascript
"0"        // true（非空字符串）
"false"    // true（非空字符串）
[]         // true（空数组是对象）
{}         // true（空对象）
function(){}  // true
```

---

### 2.4 number

**双精度 64 位浮点数**（IEEE 754 标准），范围约 `±(2^-1074 ~ 2^1024)`。

```javascript
// 整数与浮点数统一存储
console.log(0.1 + 0.2);   // 0.30000000000000004（浮点精度问题）

// 特殊数值
console.log(Infinity);    // 正无穷
console.log(-Infinity);   // 负无穷
console.log(NaN);         // Not a Number（非数字）

// NaN 的特点
console.log(NaN === NaN); // false（唯一不等于自身的值）
console.log(isNaN(NaN));  // true
console.log(Number.isNaN(NaN)); // true（ES6+，更可靠）
```

**精度问题解决方案**：

```javascript
// 方法1：整数运算
console.log((0.1 * 10 + 0.2 * 10) / 10);  // 0.3

// 方法2：toFixed（返回字符串）
console.log((0.1 + 0.2).toFixed(1));      // "0.3"

// 方法3：使用库（推荐金额计算）
// npm install decimal.js
```

---

### 2.5 bigint（ES2020+）

用于表示**任意精度**的整数，解决 number 超过 `2^53-1` 的精度丢失问题。

```javascript
// 定义方式
const big = 9007199254740993n;        // 后缀 n
const big2 = BigInt(9007199254740993); // BigInt 函数

console.log(typeof big);              // "bigint"

// 运算
console.log(big + 1n);                // 9007199254740994n

// 不能混用 number
console.log(big + 1);                 // TypeError!
console.log(big + BigInt(1));         // ✅ OK

// 比较可以混用
console.log(1n == 1);                 // true
console.log(1n === 1);                // false（类型不同）
```

---

### 2.6 string

**不可变**的 UTF-16 编码字符序列。

```javascript
const str = "hello";
str[0] = "H";             // 无效果（字符串不可变）
console.log(str);         // "hello"

// 真正"修改"需要重新赋值
let str2 = "hello";
str2 = "H" + str2.slice(1);  // "Hello"
```

**模板字符串**（ES6+）：

```javascript
const name = "Alice";
const age = 25;

// 支持插值和多行
const info = `
  Name: ${name}
  Age: ${age}
  Next year: ${age + 1}
`;

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) => 
    acc + str + (values[i] ? `<b>${values[i]}</b>` : ''), ''
  );
}
const msg = highlight`Hello ${name}, you are ${age}`;
// "Hello <b>Alice</b>, you are <b>25</b>"
```

---

### 2.7 symbol（ES6+）

**唯一且不可变**的原始值，主要用作对象属性的键，避免命名冲突。

```javascript
// 每个 Symbol 都是唯一的
const s1 = Symbol('desc');
const s2 = Symbol('desc');
console.log(s1 === s2);   // false

// 用作对象键
const id = Symbol('id');
const user = {
  name: 'Tom',
  [id]: 12345           // Symbol 键不会出现在 for...in 中
};

console.log(user[id]);    // 12345
console.log(Object.keys(user));      // ["name"]
console.log(Object.getOwnPropertySymbols(user));  // [Symbol(id)]

// 全局 Symbol 注册表
const globalSym = Symbol.for('app.id');
const sameSym = Symbol.for('app.id');
console.log(globalSym === sameSym);  // true
```

---

## 三、引用类型：object

### 3.1 基本特性

引用类型存储的是**内存地址**（引用），而非实际数据。

```javascript
const obj1 = { name: "Alice" };
const obj2 = obj1;          // 复制引用，指向同一对象

obj2.name = "Bob";
console.log(obj1.name);     // "Bob"（obj1 也被修改）
```

**内存示意**：

```
栈内存              堆内存
┌─────────┐        ┌─────────────┐
│ obj1    │───────→│ {name:"Bob"}│
│ obj2    │───────┘└─────────────┘
└─────────┘        （同一对象）
```

### 3.2 常见内置对象

```javascript
// 普通对象
const obj = {};

// 数组（特殊的对象）
const arr = [1, 2, 3];
console.log(typeof arr);    // "object"
Array.isArray(arr);         // true（判断数组的可靠方法）

// 函数（可调用对象）
function fn() {}
console.log(typeof fn);     // "function"

// 日期
const date = new Date();

// 正则
const regex = /abc/g;

// Map/Set（ES6+）
const map = new Map();
const set = new Set();
```

---

## 四、类型检测方法对比

| 方法 | 用途 | 示例 |
|------|------|------|
| `typeof` | 检测原始类型 | `typeof 123` → `"number"` |
| `instanceof` | 检测原型链 | `[] instanceof Array` → `true` |
| `Object.prototype.toString` | 最可靠的类型检测 | `[].toString.call([])` → `"[object Array]"` |
| `Array.isArray()` | 专门检测数组 | `Array.isArray([])` → `true` |
| `Number.isNaN()` | 检测 NaN | `Number.isNaN(NaN)` → `true` |

### 4.1 typeof 的局限性

```javascript
typeof null;          // "object"（历史 bug）
typeof [];            // "object"
typeof {};            // "object"
typeof function(){};  // "function"（特殊情况）
```

### 4.2 完美的类型检测函数

```javascript
function getType(value) {
  return Object.prototype.toString.call(value)
    .slice(8, -1)       // 提取 "[object Xxx]" 中的 Xxx
    .toLowerCase();
}

// 测试
getType(123);           // "number"
getType("hello");       // "string"
getType(null);          // "null"
getType([]);            // "array"
getType({});            // "object"
getType(new Date());    // "date"
getType(/abc/);         // "regexp"
getType(Promise.resolve()); // "promise"
```

---

## 五、类型转换（隐式与显式）

### 5.1 显式转换

```javascript
// 转字符串
String(123);            // "123"
(123).toString();       // "123"

// 转数字
Number("123");          // 123
Number("123abc");       // NaN
parseInt("123abc");     // 123（解析到非数字字符停止）
parseFloat("3.14");     // 3.14
Number("");             // 0
Number(null);           // 0
Number(undefined);      // NaN

// 转布尔
Boolean(1);             // true
Boolean("");            // false
!!"hello";              // true（双重否定技巧）
```

### 5.2 隐式转换（陷阱重灾区）

```javascript
// 加法：字符串优先
1 + "2";                // "12"
1 + 2 + "3";            // "33"
"1" + 2 + 3;            // "123"

// 其他运算：数字优先
"5" - 2;                // 3
"5" * 2;                // 10
"5" / 2;                // 2.5

// 比较运算
"5" == 5;               // true（字符串转数字）
"5" === 5;              // false（严格相等，推荐）

// 对象转原始值
[1,2] + [3,4];          // "1,23,4"（数组转字符串）
{} + [];                // 0（在语句开头，{}被解析为空块）
[] + {};                // "[object Object]"
```

### 5.3 对象转原始值的规则

对象在需要原始值的上下文中，会调用 `[Symbol.toPrimitive]` → `valueOf()` → `toString()`。

```javascript
const obj = {
  valueOf() {
    console.log("valueOf");
    return 42;
  },
  toString() {
    console.log("toString");
    return "hello";
  }
};

console.log(obj + 1);     // valueOf → 43
console.log(String(obj)); // toString → "hello"
```

---

## 六、实战：常见陷阱与解决方案

### 陷阱 1：typeof null === "object"

```javascript
function isNull(value) {
  return value === null;  // 只能用严格相等判断
}
```

### 陷阱 2：NaN 的自反性

```javascript
function isReallyNaN(value) {
  return value !== value;     // 只有 NaN 不等于自身
  // 或
  return Number.isNaN(value); // ES6+ 推荐
}
```

### 陷阱 3：浮点数精度

```javascript
// 比较浮点数
function equal(a, b, epsilon = 1e-10) {
  return Math.abs(a - b) < epsilon;
}
equal(0.1 + 0.2, 0.3);  // true
```

### 陷阱 4：对象比较

```javascript
{} === {};              // false（不同引用）
[] === [];              // false

// 深度相等检测（简易版）
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual(a[key], b[key]));
}
```

### 陷阱 5：隐式转换的意外

```javascript
// 防御式编程：始终使用 === 和 !==
if (value == null) {    // 同时匹配 null 和 undefined
  // 等同于 value === null || value === undefined
}

// 类型安全的默认值
const count = userInput ?? 0;  // 空值合并运算符（ES2020+）
// 区别于 ||：只有 null/undefined 时取默认值，0/false/"" 都保留
```

---

## 七、总结速查

```javascript
// 类型检测
getType(value);         // 自定义函数，最可靠
Array.isArray(arr);     // 检测数组
Number.isNaN(val);      // 检测 NaN
Number.isFinite(val);   // 检测有限数字

// 安全默认值
value ?? defaultValue;  // 空值合并（ES2020+）

// 类型转换
String(val);            // 显式转字符串
Number(val);            // 显式转数字
Boolean(val);           // 显式转布尔

// 推荐原则
// 1. 始终使用 === 和 !==
// 2. 金额计算避免直接用 number
// 3. 判断 null 用 === null
// 4. 判断数组用 Array.isArray()
```

---

**相关文章**：
- 下一篇：[作用域与闭包](./js-scope-closure.md)

**参考**：
- [MDN: JavaScript 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)
- [ECMAScript 规范](https://tc39.es/ecma262/)
