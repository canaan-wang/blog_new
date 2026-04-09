# 设计模式（JS 版）

> 设计模式是解决常见问题的最佳实践。本文介绍 JavaScript 中最实用的 8 种设计模式，结合实际代码示例。

---

## 一、单例模式（Singleton）

**确保一个类只有一个实例，并提供全局访问点。**

```javascript
// 立即执行函数实现
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    return {
      data: [],
      add(item) {
        this.data.push(item);
      },
      getAll() {
        return this.data;
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

// ES6 class 实现
class ConfigManager {
  static #instance;
  
  constructor() {
    if (ConfigManager.#instance) {
      return ConfigManager.#instance;
    }
    this.config = {};
    ConfigManager.#instance = this;
  }
  
  static getInstance() {
    if (!ConfigManager.#instance) {
      ConfigManager.#instance = new ConfigManager();
    }
    return ConfigManager.#instance;
  }
  
  set(key, value) {
    this.config[key] = value;
  }
  
  get(key) {
    return this.config[key];
  }
}

// 使用
const config1 = ConfigManager.getInstance();
const config2 = ConfigManager.getInstance();
console.log(config1 === config2);  // true
```

---

## 二、工厂模式（Factory）

**封装对象创建逻辑，解耦实例化过程。**

```javascript
// 简单工厂
class UserFactory {
  static create(type, name) {
    switch (type) {
      case "admin":
        return new Admin(name);
      case "guest":
        return new Guest(name);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
}

class Admin {
  constructor(name) {
    this.name = name;
    this.role = "admin";
    this.permissions = ["read", "write", "delete"];
  }
}

class Guest {
  constructor(name) {
    this.name = name;
    this.role = "guest";
    this.permissions = ["read"];
  }
}

// 抽象工厂（创建相关对象家族）
class UIFactory {
  createButton() {}
  createInput() {}
}

class WebFactory extends UIFactory {
  createButton() {
    return new WebButton();
  }
  createInput() {
    return new WebInput();
  }
}

class MobileFactory extends UIFactory {
  createButton() {
    return new MobileButton();
  }
  createInput() {
    return new MobileInput();
  }
}
```

---

## 三、观察者模式（Observer）

**定义对象间的一对多依赖，当一个对象变化时，所有依赖者收到通知。**

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
    
    // 返回取消订阅函数
    return () => this.off(event, listener);
  }
  
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    return this.on(event, onceWrapper);
  }
}

// 使用
const emitter = new EventEmitter();

const unsubscribe = emitter.on("data", data => {
  console.log("Received:", data);
});

emitter.emit("data", { id: 1 });  // Received: { id: 1 }
unsubscribe();
emitter.emit("data", { id: 2 });  // （无输出）
```

---

## 四、策略模式（Strategy）

**定义算法族，分别封装，让它们可以互相替换。**

```javascript
// 策略对象
const strategies = {
  normal(price) {
    return price;
  },
  member(price) {
    return price * 0.9;
  },
  vip(price) {
    return price * 0.8;
  },
  blackFriday(price) {
    return price * 0.5;
  }
};

// 上下文
class PriceCalculator {
  constructor(strategy = "normal") {
    this.strategy = strategies[strategy];
  }
  
  setStrategy(strategy) {
    this.strategy = strategies[strategy];
  }
  
  calculate(price) {
    return this.strategy(price);
  }
}

// 使用
const calculator = new PriceCalculator("member");
console.log(calculator.calculate(100));  // 90

calculator.setStrategy("vip");
console.log(calculator.calculate(100));  // 80
```

---

## 五、装饰器模式（Decorator）

**动态给对象添加职责，比继承更灵活。**

```javascript
// 基础组件
class Coffee {
  cost() {
    return 10;
  }
  
  description() {
    return "Coffee";
  }
}

// 装饰器基类
class CoffeeDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost();
  }
  
  description() {
    return this.coffee.description();
  }
}

// 具体装饰器
class Milk extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 2;
  }
  
  description() {
    return this.coffee.description() + ", Milk";
  }
}

class Sugar extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 1;
  }
  
  description() {
    return this.coffee.description() + ", Sugar";
  }
}

// 使用
let coffee = new Coffee();
coffee = new Milk(coffee);
coffee = new Sugar(coffee);

console.log(coffee.description());  // "Coffee, Milk, Sugar"
console.log(coffee.cost());         // 13

// ES 装饰器语法（实验性）
function log(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`Calling ${name} with`, args);
    return original.apply(this, args);
  };
}

class Example {
  @log
  add(a, b) {
    return a + b;
  }
}
```

---

## 六、代理模式（Proxy）

**为对象提供代理，控制对其的访问。**

```javascript
// 图片懒加载
class RealImage {
  constructor(filename) {
    this.filename = filename;
    this.loadFromDisk();
  }
  
  loadFromDisk() {
    console.log(`Loading ${this.filename}`);
  }
  
  display() {
    console.log(`Displaying ${this.filename}`);
  }
}

class ImageProxy {
  constructor(filename) {
    this.filename = filename;
    this.realImage = null;
  }
  
  display() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// 虚拟代理：按需加载
const image = new ImageProxy("photo.jpg");
// 此时未加载
image.display();  // 此时才真正加载并显示

// ES6 Proxy（更强大的代理）
const validator = {
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    target[prop] = value;
    return true;
  }
};

const person = new Proxy({}, validator);
person.age = 25;  // ✅
person.age = "25"; // ❌ TypeError
```

---

## 七、模块模式（Module）

**封装私有变量和函数，暴露公共 API。**

```javascript
// IIFE 模块
const CounterModule = (function() {
  // 私有变量
  let count = 0;
  
  // 私有函数
  function validate(n) {
    return Number.isInteger(n) && n >= 0;
  }
  
  // 公共 API
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      if (count > 0) count--;
      return count;
    },
    getCount() {
      return count;
    },
    setCount(n) {
      if (validate(n)) {
        count = n;
      }
    }
  };
})();

// ES6 模块（现代推荐）
// counter.js
let count = 0;

function validate(n) {
  return Number.isInteger(n) && n >= 0;
}

export function increment() {
  return ++count;
}

export function getCount() {
  return count;
}

// main.js
import { increment, getCount } from "./counter.js";
```

---

## 八、发布-订阅模式（Pub-Sub）

**比观察者更松散，发布者和订阅者不直接通信。**

```javascript
class PubSub {
  constructor() {
    this.topics = {};
  }
  
  subscribe(topic, callback) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }
    this.topics[topic].push(callback);
    
    return {
      unsubscribe: () => {
        this.topics[topic] = this.topics[topic].filter(cb => cb !== callback);
      }
    };
  }
  
  publish(topic, data) {
    if (!this.topics[topic]) return;
    this.topics[topic].forEach(callback => callback(data));
  }
  
  // 一次性订阅
  subscribeOnce(topic, callback) {
    const wrapper = (data) => {
      callback(data);
      this.unsubscribe(topic, wrapper);
    };
    this.subscribe(topic, wrapper);
  }
}

// 使用：跨组件通信
const bus = new PubSub();

// 组件 A 订阅
bus.subscribe("user:login", user => {
  console.log("User logged in:", user);
});

// 组件 B 发布
bus.publish("user:login", { id: 1, name: "Alice" });
```

---

## 九、模式选择指南

| 模式 | 适用场景 |
|------|---------|
| **单例** | 全局配置、数据库连接、缓存 |
| **工厂** | 根据条件创建不同类型对象 |
| **观察者** | 事件系统、数据绑定 |
| **策略** | 多种算法可互换（排序、验证）|
| **装饰器** | 动态添加功能，避免子类爆炸 |
| **代理** | 访问控制、懒加载、缓存 |
| **模块** | 封装私有状态，组织代码 |
| **发布-订阅** | 跨层级组件通信、消息总线 |

---

## 十、总结速查

```javascript
// 单例：唯一实例
// 工厂：封装创建
// 观察者：事件订阅
// 策略：算法互换
// 装饰器：动态增强
// 代理：访问控制
// 模块：私有封装
// 发布-订阅：消息解耦

// 现代 JS 简化
// - 单例：export default new Class()
// - 模块：ES6 export/import
// - 观察者：EventEmitter/EventTarget
// - 装饰器：ES 装饰器语法 / HOF
```

---

**相关文章**：
- 上一篇：[函数式编程入门](./js-functional-programming.md)
- 下一篇：[手写源码系列](./js-handwritten-code.md)

**参考**：
- [Design Patterns](https://refactoring.guru/design-patterns)
- [JavaScript Patterns](https://shichuan.github.io/javascript-patterns/)
