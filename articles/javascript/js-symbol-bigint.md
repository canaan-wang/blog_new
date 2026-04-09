# Symbol 与 BigInt

> Symbol 提供唯一的标识符，BigInt 突破数字精度限制。这两个 ES 新类型解决了 JavaScript 中长期存在的痛点问题。

---

## 一、Symbol

### 1.1 为什么需要 Symbol

```javascript
// 问题：对象属性名冲突
const cache = {};

function setCache(key, value) {
  cache[key] = value;
}

setCache("toString", "my value");
console.log(cache);  // 可能破坏对象的 toString 方法

// Symbol 提供唯一的键
const id = Symbol("id");
const id2 = Symbol("id");
console.log(id === id2);  // false（即使描述相同）
```

### 1.2 创建 Symbol

```javascript
// 基础创建
const sym1 = Symbol();
const sym2 = Symbol("description");  // 描述用于调试

// Symbol.for - 全局注册表
const globalSym1 = Symbol.for("app.id");
const globalSym2 = Symbol.for("app.id");
console.log(globalSym1 === globalSym2);  // true

// Symbol.keyFor - 获取全局 Symbol 的键
console.log(Symbol.keyFor(globalSym1));  // "app.id"
console.log(Symbol.keyFor(sym1));        // undefined（非全局）
```

### 1.3 作为对象属性键

```javascript
const id = Symbol("id");
const user = {
  name: "Alice",
  [id]: 12345  // 使用方括号
};

console.log(user[id]);       // 12345
console.log(user.id);        // undefined（不是字符串 "id"）
console.log(user["id"]);     // undefined

// Symbol 键不可枚举
console.log(Object.keys(user));        // ["name"]
console.log(Object.getOwnPropertyNames(user));  // ["name"]
console.log(JSON.stringify(user));     // {"name":"Alice"}（忽略 Symbol）

// 获取 Symbol 键
console.log(Object.getOwnPropertySymbols(user));  // [Symbol(id)]
console.log(Reflect.ownKeys(user));    // ["name", Symbol(id)]
```

### 1.4 隐藏属性模式

```javascript
// 创建私有属性的工厂函数
function createUser(name) {
  const id = Symbol("id");
  
  return {
    name,
    getId() {
      return id;
    },
    [id]: Math.random().toString(36).substr(2)
  };
}

const user = createUser("Alice");
console.log(user.getId());        // 获取 Symbol
console.log(user[user.getId()]);  // 访问私有属性

// 外部无法直接访问
const userKeys = Object.keys(user);  // ["name", "getId"]
```

### 1.5 内置 Symbol 值（Well-Known Symbols）

```javascript
// Symbol.iterator - 定义对象的默认迭代器
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      next() {
        if (this.current <= this.last) {
          return { done: false, value: this.current++ };
        }
        return { done: true };
      }
    };
  }
};

console.log([...range]);  // [1, 2, 3, 4, 5]

// Symbol.toStringTag - 自定义 Object.prototype.toString 标签
class MyClass {
  get [Symbol.toStringTag]() {
    return "MyClass";
  }
}
console.log(Object.prototype.toString.call(new MyClass()));
// "[object MyClass]"

// Symbol.toPrimitive - 自定义对象转原始值
const user = {
  name: "Alice",
  money: 1000,
  [Symbol.toPrimitive](hint) {
    console.log(`hint: ${hint}`);
    return hint === "string" ? this.name : this.money;
  }
};

console.log(String(user));   // hint: string → "Alice"
console.log(+user);          // hint: number → 1000
console.log(user + 500);     // hint: default → 1500
```

### 1.6 其他重要内置 Symbol

```javascript
// Symbol.hasInstance - 自定义 instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}
console.log([] instanceof MyArray);  // true

// Symbol.isConcatSpreadable - 控制 concat 行为
const arr1 = [1, 2];
const arr2 = [3, 4];
arr2[Symbol.isConcatSpreadable] = false;
console.log([].concat(arr1, arr2));  // [1, 2, [3, 4]]

// Symbol.species - 指定派生对象的构造函数
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array;  // map/filter 返回普通数组而非 MyArray
  }
}

// Symbol.match/replace/search/split - 自定义字符串方法
const customMatcher = {
  [Symbol.match](string) {
    return string.length > 5 ? [string] : null;
  }
};
console.log("Hello".match(customMatcher));  // null
console.log("Hello World".match(customMatcher));  // ["Hello World"]
```

---

## 二、BigInt

### 2.1 为什么需要 BigInt

```javascript
// Number 的精度限制（IEEE 754 双精度）
const maxSafe = Number.MAX_SAFE_INTEGER;  // 9007199254740991

console.log(maxSafe + 1);  // 9007199254740992 ✅
console.log(maxSafe + 2);  // 9007199254740992 ❌（精度丢失）
console.log(maxSafe + 3);  // 9007199254740994 ❌

// BigInt 解决大数问题
const big = 9007199254740993n;
console.log(big + 1n);     // 9007199254740994n ✅
```

### 2.2 创建 BigInt

```javascript
// 后缀 n
const bigint1 = 123456789012345678901234567890n;

// BigInt 构造函数
const bigint2 = BigInt("123456789012345678901234567890");
const bigint3 = BigInt(123);  // 从 Number 转换

// 不能从小数创建
BigInt(1.5);  // ❌ RangeError

// 从其他类型
BigInt(true);   // 1n
BigInt(false);  // 0n
```

### 2.3 运算

```javascript
const a = 10000000000000000n;
const b = 2n;

// 算术运算
console.log(a + b);   // 10000000000000002n
console.log(a - b);   // 9999999999999998n
console.log(a * b);   // 20000000000000000n
console.log(a / b);   // 5000000000000000n（整数除法）
console.log(a % b);   // 0n

// 比较运算
console.log(1n < 2n);   // true
console.log(1n == 1);   // true（宽松相等）
console.log(1n === 1);  // false（严格不相等，类型不同）

// 不能使用 Number 的方法
// Math.max(1n, 2n);  // ❌ TypeError
```

### 2.4 类型转换

```javascript
// BigInt 转 Number（可能丢失精度）
const big = 9007199254740993n;
const num = Number(big);  // 9007199254740992（精度丢失）

// Number 转 BigInt
const bigint = BigInt(123);  // 123n

// 转字符串
big.toString();      // "9007199254740993"
big.toString(16);    // "20000000000001"（十六进制）

// 不能用 JSON.stringify
JSON.stringify({ value: 123n });
// {"value":"123n"} 或直接报错

// 解决方案：自定义序列化
const data = {
  value: 123n,
  toJSON() {
    return { value: this.value.toString() };
  }
};
```

### 2.5 实战应用

```javascript
// 高精度计算（金融、科学计算）
function calculateInterest(principal, rate, time) {
  const p = BigInt(principal);
  const r = BigInt(rate);
  const t = BigInt(time);
  
  // 利息 = 本金 * 利率 * 时间 / 10000
  return (p * r * t) / 10000n;
}

// 大数 ID 生成
function generateId() {
  const timestamp = BigInt(Date.now());
  const random = BigInt(Math.floor(Math.random() * 1000000));
  return timestamp * 1000000n + random;
}

// 位运算（处理大标志位）
const FLAG_A = 1n << 0n;   // 1n
const FLAG_B = 1n << 1n;   // 2n
const FLAG_C = 1n << 100n; // 超大标志位
```

---

## 三、综合对比

| 特性 | Symbol | BigInt |
|------|--------|--------|
| 用途 | 唯一标识符 | 大整数运算 |
| 创建 | `Symbol()` / `Symbol.for()` | `123n` / `BigInt()` |
| typeof | `"symbol"` | `"bigint"` |
| 唯一性 | 每次创建都不同（for除外） | 值比较 |
| JSON支持 | 会被忽略 | 不支持，需自定义 |
| 主要应用场景 | 私有属性、元编程 | 金融计算、大数ID |

---

## 四、总结速查

```javascript
// Symbol
const sym = Symbol("desc");
const globalSym = Symbol.for("key");

// 对象键
const obj = { [sym]: "value" };

// 内置 Symbol
Symbol.iterator      // 迭代器
Symbol.toStringTag   // toString 标签
Symbol.toPrimitive   // 转原始值

// BigInt
const big = 123456789012345678901234567890n;
const fromNum = BigInt(123);

// 运算
big1 + big2;         // 算术运算
big1 === big2;       // 比较
Number(big);         // 转 Number（注意精度）
big.toString(16);    // 转十六进制

// 注意事项
// 1. Symbol 键不可枚举
// 2. BigInt 不能与 Number 混用
// 3. BigInt 不能用于 Math 对象
// 4. JSON 需要自定义处理
```

---

**相关文章**：
- 上一篇：[模块化发展史](./js-modules.md)
- 下一篇：[Proxy 与 Reflect](./js-proxy-reflect.md)

**参考**：
- [MDN: Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [MDN: BigInt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
