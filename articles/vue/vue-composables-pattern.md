# Composables 设计模式

> Composables 是 Vue 3 Composition API 的核心，它让你可以将有状态逻辑的函数提取出来，实现真正的逻辑复用。

---

## 一、什么是 Composable

### 1.1 定义

Composable 是一个利用 Vue Composition API **封装和复用有状态逻辑**的函数。

```javascript
// 这是一个 Composable
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { useMouse } from './useMouse'

const { x, y } = useMouse()
</script>

<template>
  Mouse: {{ x }}, {{ y }}
</template>
```

### 1.2 与 Utils 函数的区别

| 特性 | Utils | Composables |
|------|-------|-------------|
| 响应式 | ❌ 纯计算 | ✅ 可使用 ref/reactive |
| 生命周期 | ❌ 无 | ✅ 可使用 onMounted 等 |
| 副作用 | ❌ 应避免 | ✅ 可以管理 |
| 状态 | ❌ 无状态 | ✅ 可有状态 |

---

## 二、命名规范

### 2.1 use 前缀

所有 Composables 都应该以 `use` 开头：

```javascript
// ✅ 正确
useMouse()
useLocalStorage()
useFetch()

// ❌ 错误
mouse()
getLocalStorage()
fetchData()
```

### 2.2 文件命名

```
useMouse.js           // 纯 JS
useMouse.ts           // TypeScript
useMouse/index.js     // 复杂 Composable 用目录
```

---

## 三、最佳实践

### 3.1 参数处理

```javascript
// useFetch.js
import { ref, watch } from 'vue'

export function useFetch(url, options = {}) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)
  
  const { immediate = true, ...fetchOptions } = options
  
  async function execute() {
    loading.value = true
    error.value = null
    
    try {
      const res = await fetch(url, fetchOptions)
      data.value = await res.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }
  
  if (immediate) {
    execute()
  }
  
  // 监听 URL 变化自动重新获取
  watch(() => url, execute)
  
  return { data, error, loading, execute }
}
```

### 3.2 返回值规范

```javascript
// ✅ 返回对象，方便解构
export function useFeature() {
  const state = ref(0)
  const computed = computed(() => state.value * 2)
  
  function method() {
    state.value++
  }
  
  return {
    state,      // 状态
    computed,   // 计算属性
    method      // 方法
  }
}

// 使用时可选择性解构
const { state, method } = useFeature()
```

### 3.3 清理副作用

```javascript
// useEventListener.js
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, callback) {
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}

// 使用
useEventListener(window, 'resize', handleResize)
```

---

## 四、常见模式

### 4.1 异步数据获取

```javascript
// useAsync.js
import { ref, watchEffect } from 'vue'

export function useAsync(promiseFn, ...args) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(true)
  
  watchEffect(async () => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await promiseFn(...args)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })
  
  return { data, error, loading }
}
```

### 4.2 本地存储同步

```javascript
// useStorage.js
import { ref, watch } from 'vue'

export function useStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const data = ref(stored ? JSON.parse(stored) : defaultValue)
  
  watch(data, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })
  
  return data
}

// 使用
const theme = useStorage('theme', 'light')
theme.value = 'dark'  // 自动同步到 localStorage
```

---

## 五、总结速查

```javascript
// Composables 命名
useXxx()

// 基本结构
import { ref, computed, onMounted } from 'vue'

export function useFeature(initialValue) {
  // 状态
  const state = ref(initialValue)
  
  // 计算
  const doubled = computed(() => state.value * 2)
  
  // 方法
  function increment() {
    state.value++
  }
  
  // 生命周期
  onMounted(() => {
    console.log('mounted')
  })
  
  // 返回
  return { state, doubled, increment }
}

// 使用
const { state, increment } = useFeature(0)
```

---

**相关文章**：
- 上一篇：[动态组件与异步组件](./vue-dynamic-async-components.md)
- 下一篇：[常用 Composables 实现](./vue-common-composables.md)

**参考**：
- [Vue Composables](https://cn.vuejs.org/guide/reusability/composables.html)
