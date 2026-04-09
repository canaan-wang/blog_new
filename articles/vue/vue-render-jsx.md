# Vue 3 渲染函数与 JSX 实战指南

> 突破模板语法限制，掌握底层渲染能力

## 为什么需要渲染函数

模板语法虽然直观，但在某些场景下会受限：
- 需要动态生成多级嵌套组件
- 需要完全控制组件渲染逻辑
- 需要在运行时决定渲染内容
- 需要与 TypeScript 深度结合的类型安全

渲染函数（Render Function）让你直接操作虚拟 DOM，获得最大灵活性。

---

## h() 函数基础

`h()` 是创建虚拟 DOM 节点的核心函数。

```js
import { h } from 'vue'

// 签名: h(type, props?, children?)

// 1. 基本元素
h('div', { class: 'container' }, 'Hello')

// 2. 嵌套元素
h('div', { id: 'app' }, [
  h('h1', '标题'),
  h('p', '段落内容')
])

// 3. 组件
import MyComponent from './MyComponent.vue'
h(MyComponent, { propValue: 'hello' })
```

### h() 参数详解

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | String / Component / Function | 元素标签名或组件 |
| `props` | Object | 属性、事件、DOM 属性 |
| `children` | String / Number / Array / Object | 子节点 |

### 常见用法示例

```js
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    return () => h('div', {
      class: 'counter',
      onClick: () => count.value++
    }, [
      h('span', count.value),
      h('button', '+1')
    ])
  }
}
```

---

## 组件中使用渲染函数

### Options API 方式

```js
export default {
  data() {
    return { message: 'Hello' }
  },
  render(h) {
    return h('div', this.message)
  }
}
```

### Composition API 方式（推荐）

```vue
<script>
import { h, ref } from 'vue'

export default {
  setup(props, { slots, emit }) {
    const visible = ref(true)
    
    // 返回渲染函数
    return () => h('div', {
      class: { 'is-visible': visible.value }
    }, slots.default?.())
  }
}
</script>
```

### script setup + 渲染函数

```vue
<script setup>
import { h, ref } from 'vue'

const count = ref(0)

// 使用 render 编译宏
const render = () => h('div', [
  h('p', `Count: ${count.value}`),
  h('button', { onClick: () => count.value++ }, 'Increment')
])
</script>
```

---

## 条件与列表渲染

### 条件渲染

```js
import { h } from 'vue'

function renderContent(type) {
  if (type === 'text') {
    return h('span', '纯文本')
  } else if (type === 'image') {
    return h('img', { src: '/image.png' })
  } else {
    return h('div', { class: 'empty' }, '暂无内容')
  }
}

// 三元表达式
const node = condition 
  ? h('div', '条件为真')
  : h('span', '条件为假')
```

### 列表渲染

```js
import { h } from 'vue'

function renderList(items) {
  return h('ul', 
    items.map(item => 
      h('li', { key: item.id }, item.name)
    )
  )
}

// 带条件的列表
function renderFilteredList(items, filter) {
  return h('ul',
    items
      .filter(item => item.visible)
      .map(item => h('li', { key: item.id }, item.name))
  )
}
```

---

## 事件处理与 v-model

### 原生事件

```js
h('button', {
  onClick: () => console.log('clicked'),
  onMouseenter: () => console.log('hover'),
  // 修饰符用 . 连接
  onClickCapture: () => {}, // capture 模式
  onKeyupEnter: () => {},   // 特定按键
}, 'Click me')
```

### 自定义事件

```js
// 子组件
h(ChildComponent, {
  onUpdate: (val) => console.log(val),
  // v-model 等价写法
  modelValue: value,
  'onUpdate:modelValue': (val) => value = val
})
```

### v-model 完整实现

```js
import { h, ref } from 'vue'

const CustomInput = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('input', {
      value: props.modelValue,
      onInput: (e) => emit('update:modelValue', e.target.value)
    })
  }
}

// 使用
const text = ref('')
h(CustomInput, {
  modelValue: text.value,
  'onUpdate:modelValue': (val) => text.value = val
})
```

---

## 插槽处理

### 默认插槽

```js
import { h } from 'vue'

// 传递插槽内容
h(MyComponent, null, {
  default: () => h('div', '默认插槽内容')
})

// 简写（只有一个默认插槽）
h(MyComponent, null, () => h('div', '内容'))
```

### 具名插槽

```js
h(LayoutComponent, null, {
  header: () => h('nav', '导航栏'),
  default: () => h('main', '主要内容'),
  footer: () => h('footer', '页脚')
})
```

### 作用域插槽

```js
// 子组件传递数据
const ListComponent = {
  setup(props, { slots }) {
    const items = ['Apple', 'Banana', 'Cherry']
    return () => h('ul',
      items.map((item, index) => 
        h('li', slots.item?.({ item, index }))
      )
    )
  }
}

// 父组件接收数据
h(ListComponent, null, {
  item: ({ item, index }) => h('span', `${index + 1}. ${item}`)
})
```

---

## JSX 语法

JSX 让渲染函数写起来更像模板。

### 配置

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()]
})
```

```bash
npm install @vitejs/plugin-vue-jsx -D
```

### 基础 JSX

```jsx
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    return () => (
      <div className="counter">
        <span>{count.value}</span>
        <button onClick={() => count.value++}>+1</button>
      </div>
    )
  }
}
```

### JSX vs 模板对比

| 特性 | 模板语法 | JSX |
|------|----------|-----|
| 条件 | `v-if="show"` | `{show && <div/>}` |
| 循环 | `v-for="item in list"` | `{list.map(item => ...)}` |
| 事件 | `@click="handler"` | `onClick={handler}` |
| 绑定 | `:class="cls"` | `className={cls}` |
| 插槽 | `<slot name="x">` | `slots.x?.()` |

### JSX 中的指令

```jsx
// v-show
<div v-show={visible}>内容</div>

// v-html（dangerouslySetInnerHTML）
<div dangerouslySetInnerHTML={{ __html: htmlContent }} />

// v-text
<div v-text={text} />

// v-model
<input v-model={value} />
<input v-model={[value, ['number']]} />  {/* 带修饰符 */}
```

### 自定义组件 JSX

```jsx
import { ref } from 'vue'
import Child from './Child.vue'

export default {
  setup() {
    const msg = ref('Hello')
    
    return () => (
      <Child 
        title={msg.value}
        onUpdate={(val) => msg.value = val}
        v-slots={{
          default: () => <span>默认插槽</span>,
          footer: ({ year }) => <p>© {year}</p>
        }}
      />
    )
  }
}
```

---

## 函数式组件

函数式组件是无状态、无实例的轻量级组件。

```jsx
// 纯函数形式
function FunctionalButton({ text, onClick }) {
  return (
    <button class="btn" onClick={onClick}>
      {text}
    </button>
  )
}

// 使用
<FunctionalButton text="提交" onClick={handleSubmit} />
```

### 接收 slots 和 emit

```jsx
function ListItem(props, { slots, emit }) {
  return (
    <li class="list-item" onClick={() => emit('select', props.item)}>
      {slots.icon?.()}
      <span>{props.item.name}</span>
      {slots.action?.()}
    </li>
  )
}

ListItem.props = ['item']
ListItem.emits = ['select']
```

---

## 实战案例

### 动态表单生成器

```jsx
function FormGenerator({ schema, model }) {
  const renderField = (field) => {
    switch (field.type) {
      case 'input':
        return (
          <input
            value={model[field.key]}
            onInput={(e) => model[field.key] = e.target.value}
            placeholder={field.placeholder}
          />
        )
      case 'select':
        return (
          <select 
            value={model[field.key]}
            onChange={(e) => model[field.key] = e.target.value}
          >
            {field.options.map(opt => (
              <option value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <label>
            <input
              type="checkbox"
              checked={model[field.key]}
              onChange={(e) => model[field.key] = e.target.checked}
            />
            {field.label}
          </label>
        )
      default:
        return null
    }
  }

  return (
    <form>
      {schema.map(field => (
        <div key={field.key} class="form-field">
          <label>{field.label}</label>
          {renderField(field)}
        </div>
      ))}
    </form>
  )
}
```

### 递归树组件

```jsx
function TreeNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children?.length > 0

  return (
    <div class="tree-node" style={{ paddingLeft: `${level * 20}px` }}>
      <div class="node-content" onClick={() => hasChildren && setExpanded(!expanded)}>
        {hasChildren && (
          <span class="toggle">{expanded ? '▼' : '▶'}</span>
        )}
        <span class="label">{node.label}</span>
      </div>
      
      {expanded && hasChildren && (
        <div class="children">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function TreeView({ data }) {
  return (
    <div class="tree-view">
      {data.map(node => <TreeNode key={node.id} node={node} />)}
    </div>
  )
}
```

---

## 渲染函数 vs 模板：选择建议

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 常规业务组件 | 模板 | 可读性好，门槛低 |
| 需要动态生成层级 | 渲染函数 | 灵活控制嵌套 |
| 高度复用的基础组件 | 渲染函数/JSX | 类型安全，逻辑集中 |
| 复杂条件分支 | JSX | 更接近 JavaScript 语法 |
| 与 TypeScript 深度结合 | JSX | 更好的类型推断 |

---

## 速查表

```js
// 创建元素
h('div', '文本')
h('div', { class: 'foo' }, '文本')
h('div', ['子元素1', '子元素2'])

// 创建组件
h(Component, props, slots)
h(Component, { ...props, onEvent: handler })

// JSX 条件
{condition && <Component />}
{condition ? <A /> : <B />}

// JSX 循环
{list.map(item => <Item key={item.id} data={item} />)}

// 事件
onClick={handler}
onClickCapture={handler}  // capture
onKeyupEnter={handler}     // 按键修饰

// v-model
<input v-model={value} />
<input v-model={[value, 'modifier']} />
```

---

## 相关文章

- 上一篇：[Vue 3 自定义指令](./vue-custom-directives.md)
- 下一篇：Vue 3 响应式原理源码
