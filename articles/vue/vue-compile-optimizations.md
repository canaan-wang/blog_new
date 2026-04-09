# 编译优化与静态提升

> Vue 3 编译器对模板进行了多项优化，包括静态提升、PatchFlag 等，显著提升了运行时性能。

---

## 一、静态提升 (Hoist Static)

### 1.1 什么是静态提升

将模板中不会改变的部分提升到渲染函数外部，避免每次重新创建。

```vue
<template>
  <div>
    <h1>Static Title</h1>
    <p>{{ dynamic }}</p>
  </div>
</template>
```

```javascript
// 编译前（每次渲染都创建 h1）
function render() {
  return h('div', [
    h('h1', 'Static Title'),  // 静态，但每次都创建
    h('p', dynamic)
  ])
}

// 编译后（静态部分提升到外部）
const _hoisted_1 = h('h1', 'Static Title')  // 只创建一次

function render() {
  return h('div', [
    _hoisted_1,  // 复用
    h('p', dynamic)
  ])
}
```

---

## 二、PatchFlag

### 2.1 动态标记

Vue 3 在虚拟 DOM 节点上标记动态部分，Diff 时只比较标记的部分。

```vue
<template>
  <div>
    <span>Static</span>
    <span>{{ msg }}</span>
    <span :id="id">Dynamic</span>
    <span class="static">Static</span>
  </div>
</template>
```

```javascript
// 编译结果
function render() {
  return h('div', [
    _hoisted_1,  // 静态提升
    h('span', { text: msg }, null, 1 /* TEXT */),  // 只检查 text
    h('span', { id: id }, null, 2 /* CLASS */),    // 只检查 class
    _hoisted_2   // 静态提升
  ])
}
```

### 2.2 PatchFlag 类型

| Flag | 值 | 含义 |
|------|------|------|
| TEXT | 1 | 动态文本 |
| CLASS | 2 | 动态 class |
| STYLE | 4 | 动态 style |
| PROPS | 8 | 动态属性 |
| FULL_PROPS | 16 | 动态 key |
| HYDRATE_EVENTS | 32 | 事件监听 |
| STABLE_FRAGMENT | 64 | 稳定子序列 |
| KEYED_FRAGMENT | 128 | 带 key 子序列 |
| UNKEYED_FRAGMENT | 256 | 无 key 子序列 |
| NEED_PATCH | 512 | 需要 patch |
| DYNAMIC_SLOTS | 1024 | 动态 slots |

---

## 三、Block Tree

### 3.1 概念

Block 是一个特殊的虚拟节点，它会收集所有动态子节点，Diff 时只比较这些动态节点。

```vue
<template>
  <div>
    <span>Static 1</span>
    <span>{{ msg }}</span>
    <span>Static 2</span>
    <span>{{ count }}</span>
  </div>
</template>
```

```javascript
// 整个 div 是一个 Block
// 只追踪 [span(msg), span(count)] 两个动态节点
function render() {
  return h('div', null, [
    _hoisted_1,  // 静态
    span(msg),   // 动态
    _hoisted_2,  // 静态
    span(count)  // 动态
  ], 16 /* FULL_PROPS */)  // Block flag
}
```

---

## 四、总结速查

```
模板编译优化：
1. 静态提升 - 不变的节点提升到外部
2. PatchFlag - 标记动态部分
3. Block Tree - 收集动态子节点
4. 树结构打平 - 跳过静态层级

性能提升：
- Vue 2: 全量 Diff
- Vue 3: 只 Diff 动态部分
```

---

**相关文章：**
- 上一篇：[Vue 3 渲染机制](./vue-rendering-mechanism.md)
- 下一篇：[自定义指令](./vue-custom-directives.md)

**参考：**
- [Vue 3 编译优化](https://vuejs.org/guide/extras/rendering-mechanism.html#compiler-informed-virtual-dom)
