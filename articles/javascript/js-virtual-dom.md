# 虚拟 DOM 与 Diff

> 虚拟 DOM 是前端框架的性能基石。理解其结构、Diff 算法和 Key 的作用，能帮助你写出更高效的代码。

---

## 一、虚拟 DOM 概念

```javascript
// 真实 DOM（昂贵）
const realDOM = document.createElement("div");
realDOM.className = "container";
realDOM.appendChild(document.createTextNode("Hello"));

// 虚拟 DOM（轻量 JS 对象）
const vNode = {
  tag: "div",
  props: { class: "container" },
  children: [
    { tag: undefined, text: "Hello" }
  ]
};
```

---

## 二、Diff 算法

### 2.1 核心策略

```
1. 同层比较，不跨层级
2. 类型不同，直接替换
3. 类型相同，比较属性
4. key 优化列表比较
```

### 2.2 列表 Diff

```javascript
// 旧列表: A B C D
// 新列表: B A C E

// 无 Key：全部重新渲染（性能差）
// 有 Key：只移动 B，更新 A，删除 D，添加 E
```

### 2.3 Key 的重要性

```jsx
// ❌ 使用索引作为 Key
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}

// ✅ 使用唯一标识作为 Key
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}
```

---

## 三、手写简化版

```javascript
// 创建虚拟 DOM
function h(tag, props, ...children) {
  return { tag, props: props || {}, children };
}

// 渲染虚拟 DOM
function render(vNode, container) {
  const el = document.createElement(vNode.tag);
  
  // 设置属性
  Object.entries(vNode.props).forEach(([key, val]) => {
    el.setAttribute(key, val);
  });
  
  // 渲染子节点
  vNode.children.forEach(child => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else {
      render(child, el);
    }
  });
  
  container.appendChild(el);
  return el;
}

// 使用
const vDom = h("div", { class: "app" },
  h("h1", null, "Hello"),
  h("p", null, "World")
);

render(vDom, document.body);
```

---

## 四、总结速查

```javascript
// 虚拟 DOM
// - 轻量级 JS 对象
// - 批量更新减少 DOM 操作
// - 跨平台（SSR、Native）

// Diff 策略
// - 同层比较
// - 类型不同直接替换
// - Key 优化列表

// Key 原则
// - 唯一、稳定
// - 不用索引
// - 帮助框架复用节点
```

---

**相关文章**：
- 上一篇：[响应式原理](./js-reactive-principles.md)
- 下一篇：[前端路由实现](./js-frontend-router.md)

**参考**：
- [React Diff 算法](https://react.dev/learn/render-and-commit)
