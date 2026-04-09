# Vue 3 快速上手

> Vue 3 是 Vue.js 的最新主版本，带来了 Composition API、更好的 TypeScript 支持、更小的包体积和显著的性能提升。本文带你快速搭建 Vue 3 开发环境并掌握核心概念。

---

## 一、创建 Vue 3 项目

### 1.1 推荐方式：Vite

Vite 是 Vue 官方推荐的新一代构建工具，提供极速的开发体验。

```bash
# 使用 npm
npm create vue@latest

# 使用 yarn
yarn create vue

# 使用 pnpm
pnpm create vue
```

交互式选项：

```
✔ Project name: my-vue-app
✔ Add TypeScript? … No / Yes
✔ Add JSX Support? … No / Yes
✔ Add Vue Router? … No / Yes
✔ Add Pinia? … No / Yes
✔ Add Vitest? … No / Yes
✔ Add Cypress? … No / Yes
✔ Add ESLint? … No / Yes
✔ Add Prettier? … No / Yes
```

```bash
cd my-vue-app
npm install
npm run dev
```

### 1.2 使用 Vue CLI（旧项目）

```bash
# 安装 CLI
npm install -g @vue/cli

# 创建项目
vue create my-project

# 选择 Vue 3 预设
? Please pick a preset: 
  Default ([Vue 2] babel, eslint) 
❯ Default (Vue 3) ([Vue 3] babel, eslint) 
  Manually select features
```

### 1.3 直接 CDN 引入（快速体验）

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
  <div id="app">{{ message }}</div>
  
  <script>
    const { createApp } = Vue;
    
    createApp({
      data() {
        return {
          message: 'Hello Vue 3!'
        }
      }
    }).mount('#app');
  </script>
</body>
</html>
```

---

## 二、单文件组件（SFC）

Vue 单文件组件使用 `.vue` 扩展名，将模板、脚本和样式封装在一个文件中。

### 2.1 基本结构

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">
    Count is: {{ count }}
  </button>
</template>

<style scoped>
button {
  font-weight: bold;
}
</style>
```

### 2.2 各部分详解

| 区块 | 说明 | 可选 |
|------|------|------|
| `<template>` | HTML 模板 | 必需（至少一个根元素） |
| `<script>` / `<script setup>` | JavaScript 逻辑 | 可选 |
| `<style>` / `<style scoped>` | CSS 样式 | 可选 |

### 2.3 script setup 语法糖

Vue 3.2+ 推荐的简洁写法：

```vue
<script setup>
// 无需 return，定义的变量自动暴露给模板
import { ref, computed } from 'vue'

// 响应式状态
const count = ref(0)
const double = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}
</script>
```

对比传统写法：

```vue
<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    // 必须显式返回
    return { count, double, increment }
  }
}
</script>
```

---

## 三、核心概念

### 3.1 响应式数据

```vue
<script setup>
import { ref, reactive } from 'vue'

// ref：基本类型的响应式包装
const count = ref(0)
console.log(count.value) // 访问值需要 .value

// reactive：对象的响应式
const state = reactive({
  name: 'Alice',
  age: 25
})
console.log(state.name) // 直接访问属性

// 修改数据自动更新视图
function update() {
  count.value++
  state.age++
}
</script>
```

### 3.2 模板语法

```vue
<template>
  <!-- 文本插值 -->
  <span>{{ msg }}</span>
  
  <!-- 原始 HTML -->
  <p v-html="rawHtml"></p>
  
  <!-- 属性绑定 -->
  <div v-bind:id="dynamicId"></div>
  <div :id="dynamicId"></div> <!-- 简写 -->
  
  <!-- 布尔属性 -->
  <button :disabled="isDisabled">Click</button>
  
  <!-- 表达式 -->
  {{ number + 1 }}
  {{ ok ? 'YES' : 'NO' }}
  {{ message.split('').reverse().join('') }}
  
  <!-- 事件监听 -->
  <button v-on:click="doSomething"></button>
  <button @click="doSomething"></button> <!-- 简写 -->
  
  <!-- 条件渲染 -->
  <p v-if="seen">Now you see me</p>
  <p v-else-if="maybe">Maybe</p>
  <p v-else>Now you don't</p>
  
  <!-- 列表渲染 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </ul>
</template>
```

### 3.3 计算属性与侦听

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 计算属性：缓存，依赖不变不重新计算
const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

// 侦听器
watch(firstName, (newVal, oldVal) => {
  console.log('Name changed from', oldVal, 'to', newVal)
})

// 侦听多个源
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log('Full name:', newFirst, newLast)
})
</script>
```

---

## 四、组件基础

### 4.1 定义与使用组件

```vue
<!-- ChildComponent.vue -->
<script setup>
defineProps(['title'])
defineEmits(['enlarge-text'])
</script>

<template>
  <div>
    <h4>{{ title }}</h4>
    <button @click="$emit('enlarge-text')">Enlarge text</button>
  </div>
</template>
```

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const posts = ref([
  { id: 1, title: 'My journey with Vue' },
  { id: 2, title: 'Blogging with Vue' }
])

const postFontSize = ref(1)
</script>

<template>
  <div :style="{ fontSize: postFontSize + 'em' }">
    <ChildComponent
      v-for="post in posts"
      :key="post.id"
      :title="post.title"
      @enlarge-text="postFontSize += 0.1"
    />
  </div>
</template>
```

### 4.2 Props 类型声明

```vue
<script setup>
// 运行时声明
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Object,
    // 对象默认值必须工厂函数返回
    default() {
      return { message: 'hello' }
    }
  }
})

// TypeScript 声明（推荐）
const props = defineProps<{
  title: string
  likes?: number
}>()
</script>
```

---

## 五、开发环境配置

### 5.1 Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### 5.2 推荐 VSCode 插件

| 插件 | 用途 |
|------|------|
| **Volar** | Vue 3 官方语言支持（取代 Vetur） |
| **TypeScript Vue Plugin** | Volar 配套插件 |
| **ESLint** | 代码检查 |
| **Prettier** | 代码格式化 |

### 5.3 浏览器开发者工具

安装 **Vue DevTools** 浏览器扩展：
- 组件树查看
- 状态检查（ref/reactive）
- 事件追踪
- 性能分析

---

## 六、Vue 2 vs Vue 3 快速对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| **响应式原理** | Object.defineProperty | Proxy |
| **Composition API** | 需 @vue/composition-api | 内置 |
| **TypeScript** | 支持有限 | 原生支持 |
| **性能** | 良好 | 提升 1.3~2 倍 |
| **包体积** | ~23KB | ~10KB（运行时） |
| **全局 API** | Vue.use/Vue.component | app.use/app.component |
| **v-model** | .sync 修饰符 | 多个 v-model |
| **Fragment** | 单根节点 | 多根节点支持 |

---

## 七、最佳实践

```vue
<script setup>
// 1. 组合式函数抽离逻辑
import { useUser } from './composables/useUser'
import { useFetch } from './composables/useFetch'

const { user, isLoggedIn } = useUser()
const { data, error, loading } = useFetch('/api/posts')

// 2. 命名规范
// - 组件名：PascalCase
// - 组合式函数：useXxx
// - Props：camelCase（模板中自动转 kebab-case）

// 3. 模板引用
const inputRef = ref(null)
onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <!-- 4. key 的必要性 -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- 5. v-if 与 v-for 不要同时使用 -->
  <!-- 错误：v-if 优先级低于 v-for -->
  <div v-for="item in list" v-if="shouldShow">
  
  <!-- 正确：使用 computed 过滤或使用 template -->
  <template v-for="item in filteredList" :key="item.id">
    <div>{{ item.name }}</div>
  </template>
</template>
```

---

## 八、总结速查

```vue
<script setup>
// 响应式
import { ref, reactive, computed, watch } from 'vue'
const count = ref(0)           // 基本类型
const state = reactive({})     // 对象
const double = computed(() => count.value * 2)

// 生命周期
import { onMounted, onUnmounted } from 'vue'
onMounted(() => { /* ... */ })

// Props / Emits
const props = defineProps(['title'])
const emit = defineEmits(['change'])

// 模板引用
const el = ref(null)
</script>

<template>
  <!-- 插值 -->
  {{ variable }}
  
  <!-- 指令 -->
  <div v-if="condition"></div>
  <div v-for="item in list" :key="item.id"></div>
  <div :class="{ active: isActive }"></div>
  <button @click="handler"></button>
  <input v-model="text">
</template>

<style scoped>
/* scoped 样式只影响当前组件 */
</style>
```

---

**相关文章**：
- 下一篇：[Composition API 详解](./vue-composition-api.md)

**参考**：
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
