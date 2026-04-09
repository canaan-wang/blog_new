# Vue 3 渲染机制

> 理解 Vue 3 的渲染机制，包括虚拟 DOM、渲染函数 h() 和 JSX，帮助你更深入地掌握 Vue 的工作原理。

---

## 一、虚拟 DOM

### 1.1 什么是虚拟 DOM

虚拟 DOM 是对真实 DOM 的抽象表示，是一个普通的 JavaScript 对象。

```javascript
// 真实 DOM
<div id="app" class="container">
  <p>Hello</p>
</div>

// 虚拟 DOM 表示
{
  tag: 'div',
  props: { id: 'app', class: 'container' },
  children: [
    { tag: 'p', props: {}, children: ['Hello'] }
  ]
}
```

### 1.2 为什么需要虚拟 DOM

1. **跨平台**：可以渲染到 DOM、Native、Canvas 等不同平台
2. **性能优化**：通过 Diff 算法减少真实 DOM 操作
3. **声明式编程**：只需描述 UI 应该是什么样子

---

## 二、渲染函数 h()

### 2.1 h() 函数签名

```javascript
import { h } from 'vue'

// 完整签名
h(type, props?, children?)

// 示例
h('div', { id: 'app' }, 'Hello')
h('div', { class: 'container' }, [
  h('p', null, 'Paragraph 1'),
  h('p', null, 'Paragraph 2')
])
```

### 2.2 使用渲染函数写组件

```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    return () => h('div', { class: 'counter' }, [
      h('p', null, `Count: ${count.value}`),
      h('button', {
        onClick: () => count.value++
      }, 'Add')
    ])
  }
}
```

---

## 三、JSX

### 3.1 配置 JSX

```bash
npm install @vitejs/plugin-vue-jsx -D
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()]
})
```

### 3.2 JSX 语法

```jsx
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    return () => (
      <div class="counter">
        <p>Count: {count.value}</p>
        <button onClick={() => count.value++}>Add</button>
      </div>
    )
  }
}
```

### 3.3 JSX 与模板对比

| 特性 | 模板 | JSX |
|------|------|-----|
| 学习曲线 | 平缓 | 需熟悉 JS |
| 灵活性 | 受限 | 完全 JS |
| 类型支持 | 良好 | 优秀 |
| 可读性 | 更好 | 复杂逻辑更清晰 |

---

## 四、渲染流程

```
模板/渲染函数
      ↓
编译器（Compiler）
      ↓
渲染函数（Render Function）
      ↓
虚拟 DOM（VNode Tree）
      ↓
Diff 算法
      ↓
真实 DOM 更新
```

---

## 五、总结速查

```javascript
import { h } from 'vue'

// 渲染函数
h('div', { class: 'app' }, 'Hello')

// 组件
h(MyComponent, { prop: value }, slots)

// JSX
const vnode = <div class="app">Hello</div>
```

---

**相关文章：**
- 上一篇：[组合式 API 中的路由](./vue-router-composition-api.md)
- 下一篇：[编译优化与静态提升](./vue-compile-optimizations.md)

**参考：**
- [Vue 渲染函数](https://cn.vuejs.org/guide/extras/render-function.html)
