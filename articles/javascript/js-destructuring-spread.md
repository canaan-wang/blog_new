# 解构与展开运算符

> ES6 引入的解构赋值与展开运算符，让 JavaScript 的数据操作更加简洁优雅。本文深入讲解其用法、陷阱与最佳实践。

---

## 一、数组解构

### 1.1 基础解构

```javascript
// 从数组中提取值
const [a, b, c] = [1, 2, 3];
console.log(a, b, c);  // 1 2 3

// 跳过某些元素
const [, second, , fourth] = [1, 2, 3, 4];
console.log(second, fourth);  // 2 4

// 剩余元素
const [first, ...rest] = [1, 2, 3, 4];
console.log(first);   // 1
console.log(rest);    // [2, 3, 4]
```

### 1.2 默认值

```javascript
// 当值为 undefined 时使用默认值
const [a = 1, b = 2] = [undefined, null];
console.log(a);  // 1（undefined 触发默认值）
console.log(b);  // null（null 不会触发默认值）

// 默认值可以是表达式
const [value = expensiveComputation()] = [];  // 仅当需要时执行
```

### 1.3 嵌套解构

```javascript
const matrix = [[1, 2], [3, 4], [5, 6]];
const [[a, b], [c, d]] = matrix;
console.log(a, b, c, d);  // 1 2 3 4

// 实际应用：处理坐标
const points = [[10, 20], [30, 40]];
const [[x1, y1], [x2, y2]] = points;
```

---

## 二、对象解构

### 2.1 基础解构

```javascript
const user = {
  name: "Alice",
  age: 25,
  email: "alice@example.com"
};

// 提取属性
const { name, age } = user;
console.log(name, age);  // "Alice" 25

// 解构时重命名
const { name: userName, age: userAge } = user;
console.log(userName);   // "Alice"

// 默认值
const { name, country = "China" } = user;
console.log(country);    // "China"
```

### 2.2 嵌套对象解构

```javascript
const user = {
  name: "Alice",
  address: {
    city: "Beijing",
    zip: "100000"
  }
};

// 解构嵌套属性
const { address: { city, zip } } = user;
console.log(city, zip);  // "Beijing" "100000"

// 深层解构 + 重命名
const { address: { city: userCity } } = user;
console.log(userCity);   // "Beijing"
```

### 2.3 剩余属性

```javascript
const user = {
  id: 1,
  name: "Alice",
  age: 25,
  email: "alice@example.com"
};

// 提取 id，其余属性放入 rest
const { id, ...userInfo } = user;
console.log(id);         // 1
console.log(userInfo);   // { name: "Alice", age: 25, email: "..." }
```

---

## 三、实用解构技巧

### 3.1 函数参数解构

```javascript
// ❌ 传统方式
function createUser(options) {
  const name = options.name;
  const age = options.age;
  // ...
}

// ✅ 解构参数
function createUser({ name, age, role = "user" }) {
  console.log(name, age, role);
}

createUser({ name: "Alice", age: 25 });

// 深层解构
function displayUser({ 
  name, 
  address: { city } = {}  // 提供默认空对象防止报错
}) {
  console.log(`${name} lives in ${city}`);
}
```

### 3.2 交换变量

```javascript
let a = 1;
let b = 2;

// ❌ 传统方式需要临时变量
let temp = a;
a = b;
b = temp;

// ✅ 解构交换
[a, b] = [b, a];
console.log(a, b);  // 2 1

// 交换多个变量
[a, b, c] = [b, c, a];
```

### 3.3 解构返回值

```javascript
function getCoordinates() {
  return [100, 200];
}

// 直接解构返回值
const [x, y] = getCoordinates();

// 对象返回值更灵活
function getUser() {
  return { name: "Alice", age: 25 };
}

const { name, age } = getUser();

// 处理可能不存在的属性
const { data, error } = await fetchData();
if (error) {
  console.error(error);
  return;
}
// 使用 data
```

### 3.4 循环中的解构

```javascript
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 }
];

// for...of 解构
for (const { name, age } of users) {
  console.log(`${name} is ${age}`);
}

// map 解构
const names = users.map(({ name }) => name);

// Object.entries 解构
const scores = { math: 90, english: 85 };
for (const [subject, score] of Object.entries(scores)) {
  console.log(`${subject}: ${score}`);
}
```

---

## 四、展开运算符（Spread）

### 4.1 数组展开

```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// 合并数组
const combined = [...arr1, ...arr2];
console.log(combined);  // [1, 2, 3, 4, 5, 6]

// 在任意位置展开
const extended = [0, ...arr1, 3.5, ...arr2, 7];

// 数组浅拷贝
const copy = [...arr1];
console.log(copy === arr1);  // false

// 转换为数组
const str = "hello";
const chars = [...str];  // ["h", "e", "l", "l", "o"]

// 类数组转数组
const nodeList = document.querySelectorAll("div");
const nodes = [...nodeList];
```

### 4.2 对象展开

```javascript
const defaults = {
  theme: "light",
  fontSize: 14,
  showSidebar: true
};

const userPrefs = {
  theme: "dark",
  fontSize: 16
};

// 对象合并（后面的覆盖前面的）
const settings = { ...defaults, ...userPrefs };
console.log(settings);
// { theme: "dark", fontSize: 16, showSidebar: true }

// 添加/覆盖属性
const withLanguage = { ...settings, language: "zh-CN" };

// 删除属性（展开剩余属性）
const { password, ...safeUser } = user;
// safeUser 不包含 password
```

### 4.3 函数调用中的展开

```javascript
const numbers = [1, 2, 3, 4, 5];

// 代替 apply
const max = Math.max(...numbers);  // 5

// 函数调用
function sum(a, b, c) {
  return a + b + c;
}
const result = sum(...numbers);  // 6（取前三个）

// 合并参数
function greet(greeting, name) {
  console.log(`${greeting}, ${name}!`);
}

const args = ["Hello", "Alice"];
greet(...args);  // "Hello, Alice!"
```

---

## 五、剩余参数（Rest）

### 5.1 函数剩余参数

```javascript
// ❌ 传统方式使用 arguments
function sumOld() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}

// ✅ 剩余参数（真正的数组）
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4);  // 10

// 结合命名参数
function createUser(name, age, ...hobbies) {
  return { name, age, hobbies };
}

createUser("Alice", 25, "reading", "coding");
// { name: "Alice", age: 25, hobbies: ["reading", "coding"] }
```

### 5.2 剩余参数 vs arguments

| 特性 | 剩余参数 | arguments |
|------|---------|-----------|
| 类型 | 真正的数组 | 类数组对象 |
| 箭头函数 | ✅ 可用 | ❌ 不可用 |
| 命名参数 | 可以放在命名参数后 | 包含所有参数 |
| 性能 | 更好 | 一般 |

```javascript
// arguments 包含所有参数
function test(a, b) {
  console.log(arguments);  // [1, 2, 3]（类数组）
}
test(1, 2, 3);

// 剩余参数只收集剩余部分
function test2(a, b, ...rest) {
  console.log(a, b);      // 1 2
  console.log(rest);      // [3]（真正的数组）
}
test2(1, 2, 3);
```

---

## 六、常见陷阱

### 6.1 浅拷贝陷阱

```javascript
const user = {
  name: "Alice",
  address: { city: "Beijing" }
};

const copy = { ...user };
copy.address.city = "Shanghai";

console.log(user.address.city);  // "Shanghai"（原对象也被修改！）

// ✅ 深拷贝方案
const deepCopy = JSON.parse(JSON.stringify(user));  // 简单方案
// 或
import _ from "lodash";
const deepCopy2 = _.cloneDeep(user);
```

### 6.2 空值解构报错

```javascript
const data = null;
const { name } = data;  // ❌ TypeError: Cannot destructure property

// ✅ 防御式解构
const { name } = data || {};
const { city } = data?.address || {};

// 函数参数提供默认值
function process({ name } = {}) {
  console.log(name);
}
```

### 6.3 解构与重命名的混淆

```javascript
const user = { name: "Alice" };

// 解构并重命名
const { name: userName } = user;
console.log(userName);  // "Alice"
console.log(name);      // ❌ ReferenceError

// 如果要保留原属性名，不要冒号
const { name } = user;
```

### 6.4 展开运算符合并时的属性覆盖

```javascript
const a = { x: 1, y: 2 };
const b = { y: 3, z: 4 };

const merged = { ...a, ...b };
console.log(merged);  // { x: 1, y: 3, z: 4 }
// y 被后面的 b.y 覆盖

// 实现 defaults（前面的覆盖后面的）
const withDefaults = { ...defaults, ...config };
// config 的属性会覆盖 defaults
```

---

## 七、最佳实践

### 7.1 配置项合并

```javascript
const DEFAULTS = {
  timeout: 5000,
  retries: 3,
  headers: {}
};

function fetchWithConfig(url, options = {}) {
  const config = { ...DEFAULTS, ...options };
  // ...
}
```

### 7.2 不可变更新

```javascript
const state = {
  user: { name: "Alice", age: 25 },
  posts: []
};

// ✅ 不可变更新
const newState = {
  ...state,
  user: {
    ...state.user,
    age: 26
  }
};

// 或使用 Immer
import produce from "immer";
const newState2 = produce(state, draft => {
  draft.user.age = 26;
});
```

### 7.3 函数参数默认值

```javascript
// 推荐：解构 + 默认值
function renderButton({
  text = "Click",
  type = "primary",
  size = "medium",
  onClick = () => {},
  disabled = false
} = {}) {
  // ...
}

// 调用时可以只传部分
renderButton({ text: "Submit" });
renderButton();  // 全部使用默认值
```

---

## 八、总结速查

```javascript
// 数组解构
const [a, b, c] = [1, 2, 3];
const [, second] = [1, 2, 3];
const [first, ...rest] = [1, 2, 3];
const [x = 1, y = 2] = [undefined, null];

// 对象解构
const { name, age } = person;
const { name: userName } = person;
const { country = "China" } = person;
const { id, ...rest } = person;
const { address: { city } } = person;

// 展开运算符
const arr = [...arr1, ...arr2];
const obj = { ...obj1, ...obj2 };
const copy = [...original];
Math.max(...numbers);

// 剩余参数
function fn(a, b, ...rest) {}
const [first, ...others] = array;
const { id, ...restObj } = object;

// 常用技巧
// 1. 交换变量：[a, b] = [b, a]
// 2. 删除属性：const { unwanted, ...wanted } = obj
// 3. 函数参数解构：fn({ name, age }) {}
// 4. 防御式解构：const { name } = data || {}
```

---

**相关文章**：
- 上一篇：[事件循环机制](./js-event-loop.md)
- 下一篇：[Promise 与异步编程](./js-promise-async.md)
