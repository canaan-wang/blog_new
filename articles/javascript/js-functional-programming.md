# 函数式编程入门

> 函数式编程（FP）是一种以函数为核心的编程范式，强调不可变性、纯函数和声明式代码。掌握 FP 能让你的代码更简洁、更易测试。

---

## 一、FP 核心概念

### 1.1 纯函数（Pure Function）

**相同输入，永远产生相同输出，且无副作用。**

```javascript
// ❌ 不纯：依赖外部状态
let counter = 0;
function increment() {
  return ++counter;  // 修改外部状态
}

// ❌ 不纯：有副作用
function log(message) {
  console.log(message);  // 影响外部（控制台）
}

// ✅ 纯函数
function add(a, b) {
  return a + b;  // 只依赖输入，只返回输出
}

function pureIncrement(counter) {
  return counter + 1;  // 返回新值，不修改原值
}
```

**纯函数的优势**：
- 可预测、易测试
- 可缓存（相同输入直接返回结果）
- 可并行（无共享状态）
- 可组合

### 1.2 不可变性（Immutability）

**数据一旦创建，就不能修改。**

```javascript
const arr = [1, 2, 3];

// ❌ 修改原数组
arr.push(4);
arr[0] = 0;

// ✅ 返回新数组
const newArr = [...arr, 4];
const modifiedArr = arr.map((x, i) => i === 0 ? 0 : x);

const obj = { name: "Alice", age: 25 };

// ❌ 修改原对象
obj.age = 26;

// ✅ 返回新对象
const newObj = { ...obj, age: 26 };
```

---

## 二、高阶函数

**接收函数作为参数，或返回函数的函数。**

### 2.1 内置高阶函数

```javascript
const numbers = [1, 2, 3, 4, 5];

// map：转换每个元素
const doubled = numbers.map(x => x * 2);  // [2, 4, 6, 8, 10]

// filter：筛选元素
const evens = numbers.filter(x => x % 2 === 0);  // [2, 4]

// reduce：归约
const sum = numbers.reduce((acc, x) => acc + x, 0);  // 15

// find：查找第一个匹配
const found = numbers.find(x => x > 3);  // 4

// some/every：存在/全部
const hasEven = numbers.some(x => x % 2 === 0);  // true
const allPositive = numbers.every(x => x > 0);   // true
```

### 2.2 自定义高阶函数

```javascript
// 组合函数
const compose = (...fns) => x => 
  fns.reduceRight((v, f) => f(v), x);

const pipe = (...fns) => x => 
  fns.reduce((v, f) => f(v), x);

// 使用
const add5 = x => x + 5;
const multiply2 = x => x * 2;
const toString = x => String(x);

const transform = pipe(add5, multiply2, toString);
transform(10);  // "30" ((10 + 5) * 2)

// 柯里化
const curry = fn => 
  function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return (...nextArgs) => curried(...args, ...nextArgs);
    }
  };

const add = curry((a, b, c) => a + b + c);
add(1)(2)(3);     // 6
add(1, 2)(3);     // 6
add(1)(2, 3);     // 6
```

---

## 三、常用 FP 工具函数

### 3.1 基础工具库

```javascript
// 部分应用（Partial）
const partial = (fn, ...presetArgs) => 
  (...laterArgs) => fn(...presetArgs, ...laterArgs);

const add = (a, b, c) => a + b + c;
const addTo5 = partial(add, 5);
addTo5(3, 2);  // 10

// 记忆化（Memoization）
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

const fibonacci = memoize(n => {
  if (n < 2) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(50);  // 瞬间完成，非记忆化会非常慢

// 节流与防抖
const throttle = (fn, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const debounce = (fn, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};
```

### 3.2 数组操作函数

```javascript
// take：取前 n 个
const take = n => arr => arr.slice(0, n);

// skip：跳过前 n 个
const skip = n => arr => arr.slice(n);

// flatten：扁平化
const flatten = arr => 
  arr.reduce((flat, next) => 
    flat.concat(Array.isArray(next) ? flatten(next) : next), []);

// uniq：去重
const uniq = arr => [...new Set(arr)];

// groupBy：分组
const groupBy = fn => arr =>
  arr.reduce((groups, item) => {
    const key = fn(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});

// 使用示例
const users = [
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" },
  { name: "Charlie", role: "admin" }
];

const byRole = groupBy(u => u.role)(users);
// { admin: [{Alice}, {Charlie}], user: [{Bob}] }
```

---

## 四、声明式 vs 命令式

### 4.1 对比示例

```javascript
// 命令式（How）：告诉计算机怎么做
const imperative = numbers => {
  const result = [];
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0) {
      result.push(numbers[i] * 2);
    }
  }
  return result;
};

// 声明式（What）：告诉计算机要什么
const declarative = numbers =>
  numbers
    .filter(n => n % 2 === 0)
    .map(n => n * 2);

// 更声明式（命名操作）
const isEven = n => n % 2 === 0;
const double = n => n * 2;
const doubleEvens = numbers => numbers.filter(isEven).map(double);
```

---

## 五、Maybe/Option 模式

### 5.1 处理 null/undefined

```javascript
// Maybe 单子
class Maybe {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Maybe(value);
  }
  
  isNothing() {
    return this.value === null || this.value === undefined;
  }
  
  map(fn) {
    return this.isNothing() 
      ? Maybe.of(null) 
      : Maybe.of(fn(this.value));
  }
  
  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this.value;
  }
  
  chain(fn) {
    return this.map(fn).value;
  }
}

// 使用
const user = { address: { street: { name: "Main St" } } };

// ❌ 防御式编程，代码冗长
const streetName = user && user.address && user.address.street && user.address.street.name;

// ✅ Maybe 管道
const getStreetName = user =>
  Maybe.of(user)
    .map(u => u.address)
    .map(a => a.street)
    .map(s => s.name)
    .getOrElse("Unknown");

getStreetName(user);        // "Main St"
getStreetName(null);        // "Unknown"
getStreetName({});          // "Unknown"
```

---

## 六、实战：FP 重构

### 6.1 数据转换管道

```javascript
// 原始数据
const orders = [
  { id: 1, items: [{ price: 10, qty: 2 }, { price: 5, qty: 3 }], status: "completed" },
  { id: 2, items: [{ price: 20, qty: 1 }], status: "pending" },
  { id: 3, items: [{ price: 15, qty: 2 }], status: "completed" }
];

// 需求：计算已完成订单的总金额

// 函数式方案
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const completed = orders => orders.filter(o => o.status === "completed");
const calculateTotal = order => 
  order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
const sumTotals = orders => orders.map(calculateTotal).reduce((a, b) => a + b, 0);

const totalCompleted = pipe(completed, sumTotals);
totalCompleted(orders);  // 65 (20 + 15 + 30)
```

---

## 七、总结速查

```javascript
// 核心原则
// 1. 纯函数：无副作用，相同输入相同输出
// 2. 不可变：不修改数据，返回新数据
// 3. 组合：小函数组合成大功能

// 常用模式
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const curry = fn => 
  function curried(...args) {
    return args.length >= fn.length 
      ? fn(...args) 
      : (...next) => curried(...args, ...next);
  };

// 数组方法
// map, filter, reduce, find, some, every, flatMap

// 工具库推荐
// - Lodash/fp
// - Ramda
// - RxJS（响应式）
```

---

**相关文章**：
- 上一篇：[内存管理与性能](./js-memory-performance.md)
- 下一篇：[设计模式（JS 版）](./js-design-patterns.md)

**参考**：
- [Ramda](https://ramdajs.com/)
- [Mostly Adequate Guide to FP](https://mostly-adequate.gitbook.io/)
