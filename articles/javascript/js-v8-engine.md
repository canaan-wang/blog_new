# V8 引擎浅析

> V8 是 Google 开发的高性能 JavaScript 引擎，驱动 Chrome 和 Node.js。理解其编译流程、隐藏类和内联缓存，能帮助你写出更高效的代码。

---

## 一、V8 架构概览

### 1.1 执行流程

```
JavaScript 源码
      │
      ▼
┌─────────────┐
│   Parser    │  解析生成 AST
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Ignition   │  字节码解释器
│  (字节码)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   TurboFan  │  优化编译器
│  (机器码)    │
└─────────────┘
```

### 1.2 核心组件

| 组件 | 职责 |
|------|------|
| **Parser** | 词法分析 + 语法分析 → AST |
| **Ignition** | 字节码解释器，快速启动 |
| **TurboFan** | JIT 优化编译器，生成高效机器码 |
| **Sparkplug** | 快速编译器（V8 9.1+），弥补 Ignition 和 TurboFan 之间 |
| **Orinoco** | 垃圾回收器 |

---

## 二、编译过程详解

### 2.1 解析阶段

```javascript
// 源码
function add(a, b) {
  return a + b;
}

// AST（抽象语法树）
{
  "type": "FunctionDeclaration",
  "id": { "type": "Identifier", "name": "add" },
  "params": [
    { "type": "Identifier", "name": "a" },
    { "type": "Identifier", "name": "b" }
  ],
  "body": {
    "type": "BlockStatement",
    "body": [{
      "type": "ReturnStatement",
      "argument": {
        "type": "BinaryExpression",
        "operator": "+",
        "left": { "type": "Identifier", "name": "a" },
        "right": { "type": "Identifier", "name": "b" }
      }
    }]
  }
}
```

### 2.2 字节码

```javascript
// 源码
function sum(a, b) {
  return a + b;
}

// 字节码（Ignition 生成）
// 0x... @    0 : 0x0d           LdaUndefined
// 0x... @    1 : 0x40 0x01 0x00 IncBlockCounter [1], [0]
// 0x... @    4 : 0x1a 0x02      Ldar a2
// 0x... @    6 : 0x30 0x03 0x00 Add a3, [0]
// 0x... @    9 : 0xab           Return
```

查看字节码：

```bash
# Node.js
node --print-bytecode script.js

# 或 V8 标志
node --v8-options | grep bytecode
```

---

## 三、隐藏类（Hidden Class）

### 3.1 为什么需要隐藏类

JavaScript 是动态类型，但 V8 通过隐藏类给对象添加"类型信息"，实现类似静态语言的属性访问优化。

```javascript
// V8 给这个对象创建隐藏类
const point = { x: 1, y: 2 };

// 隐藏类概念示意（非真实代码）
HiddenClass_Point = {
  "x": OFFSET_0,  // x 在偏移 0
  "y": OFFSET_1   // y 在偏移 1
}
```

### 3.2 隐藏类的创建与转换

```javascript
// 1. 空对象，创建隐藏类 C0
const obj = {};
// HiddenClass: C0 (empty)

// 2. 添加 x，转换到 C1
obj.x = 1;
// HiddenClass: C1 (has 'x' at offset 0)
// Transition: C0 --add x--> C1

// 3. 添加 y，转换到 C2
obj.y = 2;
// HiddenClass: C2 (has 'x' at 0, 'y' at 1)
// Transition: C1 --add y--> C2

// 另一个对象遵循相同模式，复用隐藏类
const obj2 = {};
obj2.x = 1;  // 复用 C1
obj2.y = 2;  // 复用 C2（与 obj 相同隐藏类）
```

### 3.3 破坏隐藏类的反模式

```javascript
// ❌ 反模式1：不同属性顺序
const a = {};
a.x = 1;
a.y = 2;
// 隐藏类: C0 -> C1(x) -> C2(x,y)

const b = {};
b.y = 1;  // 不同的属性顺序
b.x = 2;
// 隐藏类: C0 -> C3(y) -> C4(y,x)（不同路径！）

// ❌ 反模式2：动态属性名
function createUser(name, prop, value) {
  const user = { name };
  user[prop] = value;  // 动态属性破坏优化
  return user;
}

// ❌ 反模式3：删除属性
const obj = { x: 1, y: 2 };
delete obj.x;  // 降级为字典模式，失去隐藏类优化

// ❌ 反模式4：混合类型
const arr = [1, 2, 3];
arr.push("string");  // 从 SMI（小整数）降级为常规数组
```

### 3.4 优化建议

```javascript
// ✅ 初始化时声明所有属性
function Point(x, y) {
  this.x = x;
  this.y = y;
  // 不要在这里添加其他属性
}

// ✅ 保持属性顺序一致
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);  // 共享隐藏类

// ✅ 使用 null 代替 delete
obj.x = null;  // 比 delete obj.x 更好

// ✅ 数组类型保持一致
const numbers = [1, 2, 3, 4];  // 纯数字
const strings = ["a", "b"];     // 纯字符串
```

---

## 四、内联缓存（Inline Cache）

### 4.1 什么是 IC

内联缓存缓存对象属性的查找结果，避免重复的属性查找过程。

```javascript
function getX(obj) {
  return obj.x;
}

const a = { x: 1 };
const b = { x: 2 };

getX(a);  // 第1次：查找属性，记录 obj 的隐藏类
getX(a);  // 第2次：命中缓存，直接读取偏移量
getX(b);  // 第3次：隐藏类相同，复用缓存
```

### 4.2 IC 状态

| 状态 | 说明 |
|------|------|
| **uninitialized** | 首次访问，未缓存 |
| **premonomorphic** | 只见过一种类型 |
| **monomorphic** | 稳定访问同一隐藏类，最优状态 |
| **polymorphic** | 访问 2-4 种不同隐藏类，仍可优化 |
| **megamorphic** | 超过 4 种隐藏类，无法缓存，降级 |

### 4.3 避免多态

```javascript
// ❌ 多态问题
function getArea(shape) {
  return shape.area();  // 不同类型的 shape
}

getArea(new Circle());    // 隐藏类 A
getArea(new Rectangle()); // 隐藏类 B
getArea(new Triangle());  // 隐藏类 C
// 进入多态甚至巨态

// ✅ 优化方案1：单一类型
function getCircleArea(circle) {
  return circle.area();  // 单态，最优
}

// ✅ 优化方案2：类型判断外提
if (shape.type === "circle") {
  getCircleArea(shape);
} else if (shape.type === "rectangle") {
  getRectangleArea(shape);
}
```

---

## 五、TurboFan 优化

### 5.1 优化触发

```javascript
function add(a, b) {
  return a + b;
}

// 前几次：Ignition 解释执行
add(1, 2);
add(3, 4);

// 调用次数达到阈值：TurboFan 优化编译
// （约 500-10000 次，取决于函数复杂度）
for (let i = 0; i < 1000; i++) {
  add(i, i + 1);
}
// 现在运行优化后的机器码
```

### 5.2 去优化（Deoptimization）

当假设不成立时，V8 会回退到字节码：

```javascript
function add(a, b) {
  return a + b;  // TurboFan 假设 a, b 都是数字
}

// 优化编译基于数字类型
for (let i = 0; i < 10000; i++) {
  add(i, i);  // 全是数字，优化生效
}

add("1", "2");  // ❌ 类型不匹配！触发去优化
add(1, 2);      // 回到解释执行
```

### 5.3 优化建议

```javascript
// ✅ 类型稳定
function calculate(x) {
  return x * 2;  // 始终期望数字
}

// ✅ 避免 arguments 滥用
function sum() {
  for (let i = 0; i < arguments.length; i++) {
    // 使用 arguments 难以优化
  }
}

// 改为
function sum(a, b, c) {  // 固定参数更易优化
  return a + b + c;
}

// ✅ try/catch 分离
try {
  // 尽量保持这里的代码简单
} catch (e) {
  // 错误处理
}
```

---

## 六、垃圾回收

### 6.1 分代回收

```
┌─────────────────────────────────────────┐
│              老生代 (Old Space)          │
│     （标记-清除、标记-整理、增量标记）      │
│              大对象存活区域               │
├─────────────────────────────────────────┤
│      新生代 (New Space) - Semi-space     │
│              From    To                  │
│     （Scavenge 算法，复制存活对象）         │
│         小对象，快速回收                  │
└─────────────────────────────────────────┘
```

### 6.2 回收策略

| 区域 | 算法 | 特点 |
|------|------|------|
| 新生代 | Scavenge | 复制存活对象，速度快 |
| 老生代 | Mark-Sweep | 标记清除，可能产生碎片 |
| 老生代 | Mark-Compact | 标记整理，消除碎片 |
| 大对象 | 独立空间 | 直接分配在老生代 |

### 6.3 内存优化建议

```javascript
// ❌ 内存泄漏
const cache = {};
function process(id) {
  if (!cache[id]) {
    cache[id] = fetchData(id);  // 无限增长！
  }
}

// ✅ LRU 缓存
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  get(key) {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);  // 移到末尾
    }
    return value;
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// ✅ 及时解除引用
let hugeData = loadHugeData();
process(hugeData);
hugeData = null;  // 允许回收
```

---

## 七、性能分析工具

### 7.1 Node.js 性能标志

```bash
# 打印优化状态
node --trace-opt script.js

# 打印去优化信息
node --trace-deopt script.js

# 打印 IC 信息
node --trace-ic script.js

# V8 统计
node --v8-natives script.js
```

### 7.2 代码层面分析

```javascript
// 查看函数优化状态（d8 shell 或特殊标志）
%OptimizeFunctionOnNextCall(myFunction);
myFunction();
%GetOptimizationStatus(myFunction);

// 结果含义：
// 1 - 已优化
// 2 - 未优化
// 3 - 总是优化
// 4 - 永不优化
// 6 - 可能去优化
```

---

## 八、总结速查

```javascript
// V8 优化友好的代码

// 1. 对象初始化声明所有属性
function Point(x, y) {
  this.x = x;
  this.y = y;
}

// 2. 保持属性顺序一致
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };

// 3. 不要 delete 属性
obj.x = null;  // ✅ 代替 delete obj.x

// 4. 数组类型一致
const arr = [1, 2, 3];  // 纯数字

// 5. 函数参数类型稳定
function add(a, b) {
  return a + b;  // 期望数字
}

// 6. 避免 arguments
function fn(a, b, c) {}  // ✅ 固定参数

// 7. 避免 with/eval
// 8. try/catch 保持简洁
```

---

**相关文章**：
- 上一篇：[Proxy 与 Reflect](./js-proxy-reflect.md)
- 下一篇：[内存管理与性能](./js-memory-performance.md)

**参考**：
- [V8 Blog](https://v8.dev/blog)
- [V8 源码](https://github.com/v8/v8)
- [TurboFan IR](https://v8.dev/docs/turbofan)
