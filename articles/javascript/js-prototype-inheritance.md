# 原型与继承

> JavaScript 的继承基于原型链而非类。理解 `[[Prototype]]`、`prototype` 与 `__proto__` 的关系，是掌握对象系统的关键。

---

## 一、原型基础概念

### 1.1 三个易混淆的概念

```javascript
// 1. [[Prototype]] —— 对象的内部属性，指向原型对象
// 2. __proto__ —— 访问 [[Prototype]] 的 getter/setter（非标准但通用）
// 3. prototype —— 函数特有的属性，用于实例继承

function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const alice = new Person("Alice");

// 关系验证
console.log(alice.__proto__ === Person.prototype);  // true
console.log(Person.prototype.constructor === Person);  // true
console.log(alice.__proto__.__proto__ === Object.prototype);  // true
```

### 1.2 原型链图解

```
┌─────────────────────────────────────────────────────┐
│                     null                             │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Object.prototype                        │
│  ┌─────────────────────────────────────────────┐    │
│  │  toString()、valueOf()、hasOwnProperty()... │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │ [[Prototype]]
┌─────────────────────▼───────────────────────────────┐
│            Person.prototype                          │
│  ┌─────────────────────────────────────────────┐    │
│  │  constructor: Person                        │    │
│  │  greet()                                    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │ [[Prototype]]
┌─────────────────────▼───────────────────────────────┐
│  const alice = { name: "Alice" }                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  name: "Alice"                              │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 二、原型链查找机制

### 2.1 属性查找流程

当访问对象属性时，JavaScript 沿着 `[[Prototype]]` 链向上查找：

```javascript
const animal = {
  eats: true,
  walk() {
    console.log("Animal walk");
  }
};

const rabbit = {
  jumps: true,
  __proto__: animal  // 原型继承（仅用于演示，实际不推荐直接操作）
};

console.log(rabbit.jumps);  // true（自身属性）
console.log(rabbit.eats);   // true（原型链查找）
rabbit.walk();              // "Animal walk"（原型方法）
```

### 2.2 属性遮蔽（Shadowing）

```javascript
const animal = {
  walk() {
    console.log("Animal walk");
  }
};

const rabbit = {
  __proto__: animal,
  walk() {
    console.log("Rabbit bounce");  // 遮蔽原型的 walk
  }
};

rabbit.walk();  // "Rabbit bounce"

// 访问被遮蔽的原型方法
rabbit.__proto__.walk();  // "Animal walk"
```

### 2.3 判断属性位置

```javascript
const obj = { a: 1 };
const child = { __proto__: obj, b: 2 };

console.log(child.hasOwnProperty("a"));  // false（原型链上的属性）
console.log(child.hasOwnProperty("b"));  // true（自身属性）

// 更安全的写法（避免原型链污染）
console.log(Object.prototype.hasOwnProperty.call(child, "a"));

// ES2022 新语法
console.log(Object.hasOwn(child, "a"));  // false
console.log(Object.hasOwn(child, "b"));  // true
```

---

## 三、创建对象与设置原型

### 3.1 Object.create() —— 推荐方式

```javascript
const animal = {
  eats: true,
  walk() {
    console.log("walk");
  }
};

// 创建以 animal 为原型的对象
const rabbit = Object.create(animal, {
  jumps: {
    value: true,
    writable: true,
    enumerable: true,
    configurable: true
  }
});

console.log(rabbit.eats);   // true（继承）
console.log(rabbit.jumps);  // true（自身）
console.log(Object.getPrototypeOf(rabbit) === animal);  // true
```

### 3.2 构造函数 + new

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  // 借用父类构造函数
  Animal.call(this, name);
  this.breed = breed;
}

// 建立原型链：Dog.prototype → Animal.prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;  // 修复 constructor

Dog.prototype.bark = function() {
  console.log("Woof!");
};

const dog = new Dog("Buddy", "Golden Retriever");
dog.eat();   // "Buddy is eating"
dog.bark();  // "Woof!"
```

### 3.3 class 语法糖（ES6+）

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  eat() {
    console.log(`${this.name} is eating`);
  }
  
  // 静态方法
  static isAnimal(obj) {
    return obj instanceof Animal;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 调用父类构造函数
    this.breed = breed;
  }
  
  bark() {
    console.log("Woof!");
  }
  
  // 覆盖父类方法
  eat() {
    super.eat();  // 调用父类方法
    console.log("Very tasty!");
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.eat();   // "Buddy is eating" "Very tasty!"
dog.bark();  // "Woof!"

console.log(Dog.prototype.__proto__ === Animal.prototype);  // true
```

---

## 四、继承方案对比

### 4.1 传统原型继承

```javascript
function Parent() {
  this.parentProp = "parent";
}
Parent.prototype.parentMethod = function() {};

function Child() {
  this.childProp = "child";
}
// ❌ 错误：会执行 Parent 构造函数
Child.prototype = new Parent();

// ✅ 正确：只链接原型
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

### 4.2 寄生组合继承（最优方案）

```javascript
function inheritProto(Child, Parent) {
  // 创建以 Parent.prototype 为原型的对象
  const prototype = Object.create(Parent.prototype);
  prototype.constructor = Child;
  Child.prototype = prototype;
}

function Parent(name) {
  this.name = name;
  this.colors = ["red", "blue"];
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);  // 继承实例属性
  this.age = age;
}

inheritProto(Child, Parent);

Child.prototype.sayAge = function() {
  console.log(this.age);
};
```

### 4.3 方案对比总结

| 方案 | 优点 | 缺点 |
|------|------|------|
| 原型链继承 | 简单 | 引用类型共享、无法传参 |
| 借用构造函数 | 可传参、不共享引用 | 方法无法复用 |
| 组合继承 | 结合优点 | 调用两次父构造函数 |
| **寄生组合继承** | 最优方案 | 代码稍复杂 |
| **class 语法糖** | 简洁易读 | 本质仍是原型继承 |

---

## 五、原型链操作

### 5.1 获取与设置原型

```javascript
const obj = {};
const proto = { x: 1 };

// 获取原型（推荐）
Object.getPrototypeOf(obj);  // Object.prototype

// 设置原型（不推荐修改已有对象的原型）
Object.setPrototypeOf(obj, proto);
console.log(obj.x);  // 1

// 检查原型
console.log(proto.isPrototypeOf(obj));  // true

// 创建无原型对象
const dict = Object.create(null);
console.log(dict.toString);  // undefined（无 Object.prototype）
```

### 5.2 instanceof 原理

```javascript
function instanceofCheck(instance, Constructor) {
  let proto = Object.getPrototypeOf(instance);
  
  while (proto) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}

// 使用
function Person() {}
const p = new Person();

console.log(p instanceof Person);      // true
console.log(instanceofCheck(p, Person));  // true
```

### 5.3 原型链的尽头

```javascript
const obj = {};

console.log(obj.__proto__);                    // Object.prototype
console.log(obj.__proto__.__proto__);          // null
console.log(Object.prototype.__proto__);       // null

console.log(Object.prototype.isPrototypeOf({}));   // true
console.log(Object.prototype.isPrototypeOf([]));   // true
console.log(Object.prototype.isPrototypeOf(function(){}));  // true
```

---

## 六、class 的深入理解

### 6.1 class 的本质

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    console.log(`Hello, ${this.name}`);
  }
}

// 等价于
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  console.log(`Hello, ${this.name}`);
};

console.log(typeof Person);           // "function"
console.log(Person === Person.prototype.constructor);  // true
```

### 6.2 class 的特殊性

```javascript
// 1. 必须 new 调用
class Foo {}
Foo();  // ❌ TypeError: Class constructor cannot be invoked without 'new'

// 2. 方法不可枚举
class Bar {
  method() {}
}
console.log(Object.keys(Bar.prototype));  // []（方法不可枚举）

// 3. 严格模式
// class 体内部自动使用严格模式

// 4. 类字段初始化顺序
class Example {
  field = this.initialize();  // 在 constructor 之前执行
  
  constructor() {
    console.log(this.field);
  }
  
  initialize() {
    return "initialized";
  }
}
```

### 6.3 私有字段与私有方法（ES2022）

```javascript
class Counter {
  #count = 0;  // 私有字段
  
  #log() {     // 私有方法
    console.log("Current:", this.#count);
  }
  
  increment() {
    this.#count++;
    this.#log();
  }
  
  get #formatted() {  // 私有 getter
    return `Count: ${this.#count}`;
  }
}

const counter = new Counter();
counter.increment();  // "Current: 1"
console.log(counter.#count);  // ❌ SyntaxError: Private field must be declared
```

---

## 七、常见陷阱与解决方案

### 陷阱 1：原型链污染

```javascript
// 危险：直接修改内置原型
Array.prototype.map = function() {
  console.log("被篡改了！");
};

// ✅ 正确做法：不修改内置原型，使用工具函数
```

### 陷阱 2：for...in 遍历原型属性

```javascript
const parent = { inherited: true };
const child = Object.create(parent);
child.own = true;

// ❌ 问题：遍历到继承属性
for (let key in child) {
  console.log(key);  // "own", "inherited"
}

// ✅ 方案1：hasOwnProperty 过滤
for (let key in child) {
  if (child.hasOwnProperty(key)) {
    console.log(key);  // "own"
  }
}

// ✅ 方案2：Object.keys（只返回自身可枚举属性）
Object.keys(child);  // ["own"]

// ✅ 方案3：Object.getOwnPropertyNames（所有自身属性）
Object.getOwnPropertyNames(child);  // ["own"]
```

### 陷阱 3：箭头函数与原型方法

```javascript
class Example {
  value = 42;
  
  // ❌ 箭头函数定义在实例上，不在原型上
  arrowMethod = () => {
    console.log(this.value);
  }
  
  // ✅ 普通方法定义在原型上
  normalMethod() {
    console.log(this.value);
  }
}

const ex = new Example();
console.log(ex.hasOwnProperty("arrowMethod"));   // true
console.log(ex.hasOwnProperty("normalMethod"));  // false
```

---

## 八、总结速查

```javascript
// 原型链核心概念
obj.__proto__                    // 访问原型（getter/setter）
Object.getPrototypeOf(obj)       // 获取原型（推荐）
Object.setPrototypeOf(obj, proto) // 设置原型
Object.create(proto)             // 创建指定原型对象

// 继承实现
// 1. Object.create（对象继承）
const child = Object.create(parent);

// 2. 构造函数继承
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 3. class 语法糖
class Child extends Parent {
  constructor() {
    super();
  }
}

// 属性检测
obj.hasOwnProperty("key")        // 自身属性
Object.hasOwn(obj, "key")        // ES2022 推荐
"key" in obj                     // 原型链查找

// 类型检测
obj instanceof Constructor       // 检查原型链
Constructor.prototype.isPrototypeOf(obj)  // 同上
```

---

**相关文章**：
- 上一篇：[this 指向详解](./js-this-binding.md)
- 下一篇：[事件循环机制](./js-event-loop.md)

**参考**：
- [MDN: 继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [JavaScript.info: Prototype](https://javascript.info/prototype-inheritance)
