# 组件实例与模板引用

> 模板引用让你直接访问 DOM 元素或组件实例，虽然应优先使用 Props/Emits，但在特定场景下模板引用是必要的。

---

## 一、访问 DOM 元素

### 1.1 基本用法

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() => {
  // DOM 元素在 mounted 后可用
  inputRef.value?.focus()
})

function focusInput() {
  inputRef.value?.focus()
}
</script>

<template>
  <input ref="inputRef" type="text" />
  <button @click="focusInput">Focus</button>
</template>
```

### 1.2 v-for 中的引用

```vue
<script setup>
import { ref, onMounted } from 'vue'

const items = ref([1, 2, 3])
const itemRefs = ref([])

onMounted(() => {
  // itemRefs.value 是元素数组
  console.log(itemRefs.value)
})
</script>

<template>
  <div v-for="item in items" :key="item" :ref="el => { if (el) itemRefs[item-1] = el }">
    {{ item }}
  </div>
</template>
```

---

## 二、访问组件实例

### 2.1 基本用法

```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const message = ref('Hello')

function increment() {
  count.value++
}

function reset() {
  count.value = 0
  message.value = 'Reset'
}

// 暴露给父组件
defineExpose({
  count,
  message,
  reset
})
</script>
```

```vue
<!-- Parent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

function callChildMethod() {
  // 访问暴露的方法
  childRef.value?.reset()
  console.log(childRef.value?.count)
}
</script>

<template>
  <ChildComponent ref="childRef" />
  <button @click="callChildMethod">Reset Child</button>
</template>
```

### 2.2 不暴露内部状态

```vue
<script setup>
import { ref } from 'vue'

// 内部状态（不暴露）
const internalState = ref('private')

// 公开状态（暴露）
const publicState = ref('public')

defineExpose({
  // 只暴露需要父组件访问的内容
  publicState,
  doSomething
})

function doSomething() {
  // ...
}
</script>
```

---

## 三、常见使用场景

### 3.1 自动聚焦

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" placeholder="Auto focus" />
</template>
```

### 3.2 滚动到元素

```vue
<script setup>
import { ref } from 'vue'

const sectionRef = ref(null)

function scrollToSection() {
  sectionRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <button @click="scrollToSection">Scroll to Section</button>
  
  <div ref="sectionRef" class="section">
    Target Section
  </div>
</template>
```

### 3.3 第三方库集成

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart } from 'chart.js'

const canvasRef = ref(null)
let chart = null

onMounted(() => {
  if (canvasRef.value) {
    chart = new Chart(canvasRef.value, {
      type: 'bar',
      data: { /* ... */ }
    })
  }
})

onUnmounted(() => {
  chart?.destroy()
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
```

---

## 四、组件递归

### 4.1 递归组件

```vue
<!-- TreeItem.vue -->
<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})

const isOpen = ref(false)
const isFolder = computed(() => {
  return props.item.children?.length > 0
})
</script>

<template>
  <li>
    <div @click="isOpen = !isOpen">
      {{ item.name }}
      <span v-if="isFolder">{{ isOpen ? '-' : '+' }}</span>
    </div>
    
    <ul v-show="isOpen" v-if="isFolder">
      <TreeItem 
        v-for="child in item.children" 
        :key="child.id"
        :item="child"
      />
    </ul>
  </li>
</template>
```

### 4.2 使用递归组件

```vue
<script setup>
import TreeItem from './TreeItem.vue'

const treeData = {
  name: 'Root',
  children: [
    {
      name: 'Child 1',
      children: [
        { name: 'Grandchild 1' },
        { name: 'Grandchild 2' }
      ]
    },
    { name: 'Child 2' }
  ]
}
</script>

<template>
  <ul>
    <TreeItem :item="treeData" />
  </ul>
</template>
```

---

## 五、总结速查

```vue
<script setup>
import { ref, onMounted } from 'vue'

// DOM 引用
const elRef = ref(null)

// 组件引用
const childRef = ref(null)

onMounted(() => {
  // DOM 操作
  elRef.value?.focus()
  
  // 访问子组件（需 defineExpose）
  childRef.value?.someMethod()
})

// 子组件暴露
defineExpose({
  publicMethod,
  publicState
})
</script>

<template>
  <div ref="elRef"></div>
  <ChildComponent ref="childRef" />
</template>
```

---

**相关文章**：
- 上一篇：[Provide / Inject](./vue-provide-inject.md)
- 下一篇：[动态组件与异步组件](./vue-dynamic-async-components.md)

**参考**：
- [Vue 模板引用](https://cn.vuejs.org/guide/essentials/template-refs.html)
