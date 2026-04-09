# Proxy 与 Reflect

> Proxy 让你拦截并自定义对象的基本操作，Reflect 提供了一套标准化的对象操作方法。二者结合，是元编程的强大工具。

---

## 一、Proxy 基础

### 1.1 什么是 Proxy

Proxy 是对象的代理，可以拦截对目标对象的各种操作。

```javascript
const target = {
  name: "Alice",
  age: 25
};

const handler = {
  get(target, property) {
    console.log(`Getting ${property}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`Setting ${property} = ${value}`);
    target[property] = value;
    return true;  // 表示设置成功
  }
};

const proxy = new Proxy(target, handler);

proxy.name;        // Getting name → "Alice"
proxy.age = 26;    // Setting age = 26
```

### 1.2 常用拦截器

```javascript
const handler = {
  // 读取属性
  get(target, prop, receiver) {
    if (prop in target) {
      return target[prop];
    }
    return `Property ${prop} not found`;
  },
  
  // 设置属性
  set(target, prop, value, receiver) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    target[prop] = value;
    return true;
  },
  
  // 判断属性是否存在
  has(target, prop) {
    return prop in target && !prop.startsWith("_");
  },
  
  // 删除属性
  deleteProperty(target, prop) {
    if (prop.startsWith("_")) {
      throw new Error("Cannot delete private property");
    }
    delete target[prop];
    return true;
  },
  
  // 遍历属性
  ownKeys(target) {
    return Object.keys(target).filter(key => !key.startsWith("_"));
  }
};
```

---

## 二、实战应用场景

### 2.1 数据验证

```javascript
function createValidator(schema) {
  return {
    set(target, key, value) {
      const validator = schema[key];
      
      if (validator && !validator(value)) {
        throw new TypeError(`Invalid value for ${key}: ${value}`);
      }
      
      target[key] = value;
      return true;
    }
  };
}

const userSchema = {
  name: v => typeof v === "string",
  age: v => Number.isInteger(v) && v >= 0 && v <= 150
};

const user = new Proxy({}, createValidator(userSchema));

user.name = "Alice";  // ✅
user.age = 25;        // ✅
user.age = -5;        // ❌ TypeError
```

### 2.2 私有属性保护

```javascript
function withPrivate(target) {
  return new Proxy(target, {
    get(target, prop) {
      if (typeof prop === "string" && prop.startsWith("_")) {
        throw new Error(`Private property "${prop}" is not accessible`);
      }
      return target[prop];
    },
    set(target, prop, value) {
      if (typeof prop === "string" && prop.startsWith("_")) {
        throw new Error(`Cannot modify private property "${prop}"`);
      }
      target[prop] = value;
      return true;
    },
    has(target, prop) {
      return prop in target && !String(prop).startsWith("_");
    },
    ownKeys(target) {
      return Object.keys(target).filter(k => !k.startsWith("_"));
    }
  });
}

const user = withPrivate({
  name: "Alice",
  _password: "secret123"
});

console.log(user.name);        // "Alice"
console.log(user._password);   // ❌ Error
console.log(Object.keys(user)); // ["name"]
```

### 2.3 响应式系统（简化版 Vue）

```javascript
function reactive(target) {
  const deps = new Map();
  
  return new Proxy(target, {
    get(target, key) {
      // 收集依赖（简化版）
      track(deps, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      // 触发更新
      trigger(deps, key);
      return true;
    }
  });
}

// 简化实现
const activeEffect = null;

function track(deps, key) {
  if (!activeEffect) return;
  if (!deps.has(key)) {
    deps.set(key, new Set());
  }
  deps.get(key).add(activeEffect);
}

function trigger(deps, key) {
  const effects = deps.get(key);
  if (effects) {
    effects.forEach(effect => effect());
  }
}

// 使用
const state = reactive({ count: 0 });
state.count++;  // 触发更新
```

### 2.4 数据格式化（DOM 属性风格）

```javascript
const user = {
  firstName: "Alice",
  lastName: "Smith"
};

const proxy = new Proxy(user, {
  get(target, prop) {
    // 支持驼峰和下划线
    const key = Object.keys(target).find(k => 
      k.toLowerCase() === prop.toLowerCase()
    );
    
    if (key) return target[key];
    
    // 计算属性
    if (prop === "fullName") {
      return `${target.firstName} ${target.lastName}`;
    }
    
    return target[prop];
  }
});

console.log(proxy.firstname);  // "Alice"（大小写不敏感）
console.log(proxy.FIRST_NAME); // "Alice"
console.log(proxy.fullName);   // "Alice Smith"
```

### 2.5 函数参数日志

```javascript
function withLogging(fn) {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      console.log(`Calling ${target.name} with:`, args);
      const result = Reflect.apply(target, thisArg, args);
      console.log(`Result:`, result);
      return result;
    }
  });
}

function add(a, b) {
  return a + b;
}

const loggedAdd = withLogging(add);
loggedAdd(2, 3);
// Calling add with: [2, 3]
// Result: 5
```

---

## 三、Reflect API

### 3.1 什么是 Reflect

Reflect 是一个内置对象，提供拦截 JavaScript 操作的方法，与 Proxy handler 一一对应。

```javascript
// 传统方式
"name" in obj;                    // 检查属性
Object.defineProperty(obj, ...);  // 定义属性
Function.prototype.apply.call(fn, thisArg, args);

// Reflect 方式（函数式，返回 boolean）
Reflect.has(obj, "name");
Reflect.defineProperty(obj, ...);
Reflect.apply(fn, thisArg, args);
```

### 3.2 方法列表

```javascript
Reflect.get(target, prop, receiver);              // 获取属性
Reflect.set(target, prop, value, receiver);       // 设置属性
Reflect.has(target, prop);                        // 检查属性
Reflect.deleteProperty(target, prop);             // 删除属性
Reflect.getOwnPropertyDescriptor(target, prop);   // 获取描述符
Reflect.defineProperty(target, prop, descriptor); // 定义属性
Reflect.getPrototypeOf(target);                   // 获取原型
Reflect.setPrototypeOf(target, proto);            // 设置原型
Reflect.isExtensible(target);                     // 是否可扩展
Reflect.preventExtensions(target);                // 禁止扩展
Reflect.ownKeys(target);                          // 获取所有键
Reflect.apply(target, thisArg, args);             // 调用函数
Reflect.construct(target, args, newTarget);       // new 操作符
```

### 3.3 为什么使用 Reflect

```javascript
const proxy = new Proxy(target, {
  // ❌ 不转发 receiver，可能导致 this 绑定问题
  get(target, prop) {
    return target[prop];
  },
  
  // ✅ 正确转发
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  },
  
  // ✅ 更简洁
  get: Reflect.get
});

// Reflect.set 返回 boolean 表示是否成功
const success = Reflect.set(obj, "key", "value");
if (!success) {
  console.log("Failed to set property");
}
```

---

## 四、Proxy + Reflect 最佳实践

### 4.1 默认转发

```javascript
const loggingProxy = new Proxy(target, {
  get(target, prop, receiver) {
    console.log(`Access: ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Modify: ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },
  deleteProperty(target, prop) {
    console.log(`Delete: ${String(prop)}`);
    return Reflect.deleteProperty(target, prop);
  }
});
```

### 4.2 只读代理

```javascript
function readonly(target) {
  return new Proxy(target, {
    set(target, prop) {
      throw new Error(`Cannot set ${String(prop)}: object is read-only`);
    },
    deleteProperty(target, prop) {
      throw new Error(`Cannot delete ${String(prop)}: object is read-only`);
    }
  });
}

const config = readonly({ apiUrl: "https://api.example.com" });
config.apiUrl = "new";  // ❌ Error
```

### 4.3 深度代理

```javascript
function deepProxy(target, handler) {
  // 递归处理嵌套对象
  Object.keys(target).forEach(key => {
    if (typeof target[key] === "object" && target[key] !== null) {
      target[key] = deepProxy(target[key], handler);
    }
  });
  
  return new Proxy(target, {
    ...handler,
    set(target, prop, value, receiver) {
      // 新值也包装为代理
      if (typeof value === "object" && value !== null) {
        value = deepProxy(value, handler);
      }
      return Reflect.set(target, prop, value, receiver);
    }
  });
}
```

---

## 五、局限性与注意事项

### 5.1 不能代理的对象

```javascript
// 以下对象不能被代理或代理后行为异常

// 1. 原始值（必须用对象包装）
new Proxy(123, {});  // ❌ TypeError

// 2. Date（需要特殊处理）
const date = new Proxy(new Date(), {});
date.getTime();  // ❌ TypeError: this is not a Date object

// 3. Map/Set/WeakMap/WeakSet
// 需要拦截 get 来返回包装后的方法
```

### 5.2 性能考虑

```javascript
// Proxy 有性能开销，不要在热路径过度使用

// ❌ 问题：每次访问都经过代理
function createReactive(obj) {
  return new Proxy(obj, { get, set });
}

// ✅ 优化：只在需要时创建代理
const cache = new WeakMap();

function getProxy(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const proxy = new Proxy(obj, handler);
  cache.set(obj, proxy);
  return proxy;
}
```

### 5.3 this 绑定问题

```javascript
const target = {
  value: 42,
  getValue() {
    return this.value;
  }
};

const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    // receiver 是 proxy，不是 target
    return target[prop];  // 丢失了正确的 this
  }
});

// ✅ 正确使用 Reflect
const proxy2 = new Proxy(target, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  }
});

console.log(proxy2.getValue());  // 42
```

---

## 六、总结速查

```javascript
// 创建 Proxy
const proxy = new Proxy(target, {
  get(target, prop, receiver) { },
  set(target, prop, value, receiver) { return true; },
  has(target, prop) { return true; },
  deleteProperty(target, prop) { return true; },
  ownKeys(target) { return []; },
  apply(target, thisArg, args) { },
  construct(target, args) { return {}; }
});

// Reflect API
Reflect.get(target, prop, receiver);
Reflect.set(target, prop, value, receiver);
Reflect.has(target, prop);
Reflect.deleteProperty(target, prop);
Reflect.apply(fn, thisArg, args);
Reflect.construct(Constructor, args);
Reflect.ownKeys(target);

// 常用模式
// 1. 数据验证：拦截 set
// 2. 私有属性：过滤 _ 开头的属性
// 3. 响应式：get 收集依赖，set 触发更新
// 4. 日志：拦截所有操作并记录
// 5. 只读：禁止 set 和 delete

// 最佳实践
// 1. 使用 Reflect 转发操作
// 2. get/set 返回 boolean 表示成功
// 3. 注意 this 绑定问题，使用 receiver
// 4. 代理嵌套对象需要递归处理
```

---

**相关文章**：
- 上一篇：[Symbol 与 BigInt](./js-symbol-bigint.md)
- 下一篇：[V8 引擎浅析](./js-v8-engine.md)

**参考**：
- [MDN: Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [MDN: Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
