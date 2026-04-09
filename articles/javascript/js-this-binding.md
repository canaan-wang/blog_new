# this 指向详解

> `this` 是 JavaScript 中最令人困惑的概念之一。本文彻底讲清四种绑定规则、箭头函数特性，并手写实现 call/apply/bind。

---

## 一、this 到底是什么

`this` 是函数执行时的**上下文对象**，它的值在**运行时**确定，而非定义时。

```javascript
function identify() {
  return this.name;
}

const person1 = { name: "Alice" };
const person2 = { name: "Bob" };

person1.identify = identify;
person2.identify = identify;

console.log(person1.identify());  // "Alice"
console.log(person2.identify());  // "Bob"
```

> 💡 **关键认知**：`this` 不指向函数本身，也不指向函数的词法作用域。

---

## 二、四种绑定规则

### 2.1 默认绑定（Default Binding）

**独立函数调用**，非严格模式指向全局对象，严格模式指向 `undefined`。

```javascript
function foo() {
  console.log(this);
}

foo();  // 浏览器：window，Node.js：global

// 严格模式
"use strict";
function strictFoo() {
  console.log(this);  // undefined
}
strictFoo();
```

### 2.2 隐式绑定（Implicit Binding）

**作为对象方法调用**，`this` 指向调用该方法的对象。

```javascript
const person = {
  name: "Alice",
  greet() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

person.greet();  // "Hello, I'm Alice"
```

**隐式丢失问题**：

```javascript
const greet = person.greet;  // 函数引用赋值
greet();  // "Hello, I'm undefined"（默认绑定）

// 回调函数中的丢失
setTimeout(person.greet, 100);  // this 丢失
```

### 2.3 显式绑定（Explicit Binding）

使用 `call`、`apply`、`bind` 强制指定 `this`。

```javascript
function introduce(city, country) {
  console.log(`${this.name} from ${city}, ${country}`);
}

const person = { name: "Alice" };

// call：逐个传参
introduce.call(person, "Beijing", "China");

// apply：数组传参
introduce.apply(person, ["Beijing", "China"]);

// bind：返回绑定 this 的新函数
const boundIntroduce = introduce.bind(person, "Beijing");
boundIntroduce("China");  // 可继续传参
```

**call vs apply vs bind 对比**：

| 方法 | 调用时机 | 参数形式 | 返回值 |
|------|---------|---------|--------|
| call | 立即调用 | 逐个列出 | 函数返回值 |
| apply | 立即调用 | 数组 | 函数返回值 |
| bind | 延迟调用 | 逐个列出 | 绑定 this 的新函数 |

### 2.4 new 绑定（Constructor Binding）

使用 `new` 调用函数时，`this` 指向新创建的实例对象。

```javascript
function Person(name) {
  this.name = name;  // this 指向新创建的实例
}

const alice = new Person("Alice");
console.log(alice.name);  // "Alice"

// 等价的 ES6 class
class PersonClass {
  constructor(name) {
    this.name = name;
  }
}
```

**new 的过程**：
1. 创建空对象
2. 对象的原型链接到构造函数的 `prototype`
3. 构造函数执行，`this` 绑定到新对象
4. 返回该对象（除非构造函数返回其他对象）

---

## 三、绑定优先级

当多种规则冲突时，按以下**优先级**决定 `this`：

```
new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定
```

```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1, foo };
const obj2 = { a: 2, foo };

obj1.foo();           // 1（隐式绑定）
obj2.foo();           // 2（隐式绑定）

obj1.foo.call(obj2);  // 2（显式 > 隐式）

const boundFoo = foo.bind(obj1);
new boundFoo();       // undefined（new > 显式绑定，a 未定义）
```

---

## 四、箭头函数与 this

### 4.1 箭头函数的特性

箭头函数**没有自己的 this**，它会**继承外层作用域**的 `this`。

```javascript
const obj = {
  name: "Alice",
  regularFunc: function() {
    console.log(this.name);  // "Alice"
  },
  arrowFunc: () => {
    console.log(this.name);  // undefined（继承全局作用域）
  }
};

obj.regularFunc();
obj.arrowFunc();
```

### 4.2 箭头函数的正确使用场景

```javascript
const team = {
  name: "开发组",
  members: ["Alice", "Bob"],
  
  // ❌ 传统函数需要 that = this  hack
  greetWrong: function() {
    const that = this;
    this.members.forEach(function(member) {
      console.log(`${member} is in ${that.name}`);
    });
  },
  
  // ✅ 箭头函数自动继承 this
  greetRight: function() {
    this.members.forEach(member => {
      console.log(`${member} is in ${this.name}`);
    });
  }
};

team.greetRight();
// "Alice is in 开发组"
// "Bob is in 开发组"
```

### 4.3 箭头函数的注意事项

```javascript
// 1. 不能作为构造函数
const Foo = () => {};
new Foo();  // ❌ TypeError

// 2. 没有 arguments 对象
const bar = () => console.log(arguments);  // 继承外层 arguments
const baz = function() {
  const arrow = () => console.log(arguments);  // 可用
  arrow();
};

// 3. 不能用 call/apply/bind 改变 this
const obj = { name: "test" };
const arrow = () => console.log(this);
arrow.call(obj);  // 无效，this 仍指向外层
```

---

## 五、手写实现 call/apply/bind

### 5.1 手写 call

```javascript
Function.prototype.myCall = function(context, ...args) {
  // 1. 处理 context 为 null/undefined 的情况
  context = context || globalThis;
  
  // 2. 创建唯一属性名，避免覆盖
  const fnSymbol = Symbol('fn');
  
  // 3. 将函数作为 context 的方法
  context[fnSymbol] = this;
  
  // 4. 调用并保存结果
  const result = context[fnSymbol](...args);
  
  // 5. 删除临时属性
  delete context[fnSymbol];
  
  // 6. 返回结果
  return result;
};

// 测试
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

greet.myCall({ name: "Alice" }, "Hello");  // "Hello, Alice"
```

### 5.2 手写 apply

```javascript
Function.prototype.myApply = function(context, args) {
  context = context || globalThis;
  const fnSymbol = Symbol('fn');
  context[fnSymbol] = this;
  
  // 处理 args 为 null/undefined
  args = args || [];
  
  const result = context[fnSymbol](...args);
  delete context[fnSymbol];
  return result;
};

// 测试
greet.myApply({ name: "Bob" }, ["Hi"]);  // "Hi, Bob"
```

### 5.3 手写 bind

```javascript
Function.prototype.myBind = function(context, ...bindArgs) {
  const self = this;
  
  return function(...callArgs) {
    // 合并绑定时和调用时的参数
    return self.apply(context, [...bindArgs, ...callArgs]);
  };
};

// 测试
const boundGreet = greet.myBind({ name: "Charlie" }, "Hey");
boundGreet();  // "Hey, Charlie"
boundGreet("!");  // "Hey, !, Charlie"（参数合并）
```

### 5.4 完善的 bind 实现（支持 new）

```javascript
Function.prototype.myBind = function(context, ...bindArgs) {
  const self = this;
  
  function boundFunction(...callArgs) {
    // 判断是否通过 new 调用
    const isNew = this instanceof boundFunction;
    
    // new 调用时 this 指向实例，否则使用绑定的 context
    const actualContext = isNew ? this : context;
    
    return self.apply(actualContext, [...bindArgs, ...callArgs]);
  }
  
  // 维护原型链
  boundFunction.prototype = Object.create(self.prototype);
  
  return boundFunction;
};
```

---

## 六、this 判断流程图

```
函数调用时判断 this：

1. 是否是箭头函数？
   → 是：继承外层 this（结束）
   → 否：继续

2. 是否使用 new 调用？
   → 是：this = 新创建的对象（结束）
   → 否：继续

3. 是否使用 call/apply/bind？
   → 是：this = 指定的对象（结束）
   → 否：继续

4. 是否作为对象方法调用？
   → 是：this = 调用者（结束）
   → 否：继续

5. 默认绑定
   → 严格模式：undefined
   → 非严格模式：全局对象
```

---

## 七、常见陷阱与解决方案

### 陷阱 1：回调函数丢失 this

```javascript
const obj = {
  value: 42,
  getValue() {
    return this.value;
  }
};

// ❌ 问题
setTimeout(obj.getValue, 100);  // 返回 NaN（this 变成全局）

// ✅ 方案1：箭头函数
setTimeout(() => obj.getValue(), 100);

// ✅ 方案2：bind
setTimeout(obj.getValue.bind(obj), 100);

// ✅ 方案3：wrapper
setTimeout(function() {
  obj.getValue();
}, 100);
```

### 陷阱 2：DOM 事件回调

```javascript
const button = document.querySelector("button");

const handler = {
  message: "Clicked!",
  handleClick: function() {
    console.log(this.message);  // 期望 handler
  }
};

// ❌ 问题：this 指向 buttonutton.addEventListener("click", handler.handleClick);

// ✅ 方案1：箭头函数
handleClick: () => {
  console.log(this.message);  // 继承 handler
}

// ✅ 方案2：bind
button.addEventListener("click", handler.handleClick.bind(handler));
```

### 陷阱 3：类方法 this

```javascript
class Counter {
  count = 0;
  
  // ❌ 方法在回调中丢失 this
  increment() {
    this.count++;
  }
  
  // ✅ 方案1：箭头函数属性（类字段）
  decrement = () => {
    this.count--;
  }
}

const counter = new Counter();
const btn = document.querySelector("button");

btn.addEventListener("click", counter.increment);  // ❌
btn.addEventListener("click", counter.decrement);  // ✅
```

---

## 八、总结速查

```javascript
// 四种绑定规则
function foo() { console.log(this); }

foo();                           // 默认绑定
obj.foo();                       // 隐式绑定
foo.call(obj);                   // 显式绑定
new foo();                       // new 绑定

// 优先级：new > 显式 > 隐式 > 默认

// 箭头函数
const arrow = () => this;      // 继承外层 this
// 不能用 call/apply/bind 改变
// 不能作为构造函数
// 没有 arguments

// 绑定 this 的方法
fn.call(context, arg1, arg2);    // 立即调用
fn.apply(context, [arg1, arg2]); // 立即调用
fn.bind(context, arg1);          // 返回新函数
```

---

**相关文章**：
- 上一篇：[作用域与闭包](./js-scope-closure.md)
- 下一篇：[原型与继承](./js-prototype-inheritance.md)

**参考**：
- [MDN: this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [You Don't Know JS: this & Object Prototypes](https://github.com/getify/You-Dont-Know-JS)
