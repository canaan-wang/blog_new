# 常用 Composables 实现

> 掌握常用 Composables 的实现方式，提升代码复用能力。本文提供可直接使用的实用 Composables。

---

## 一、useFetch - 数据获取

```javascript
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url, options = {}) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)
  const { immediate = true } = options

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await fetch(toValue(url))
      if (!res.ok) throw new Error(res.statusText)
      data.value = await res.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    watchEffect(execute)
  }

  return { data, error, loading, execute }
}
```

**使用：**
```vue
<script setup>
import { useFetch } from './useFetch'

const { data: posts, loading, error } = useFetch('/api/posts')
</script>
```

---

## 二、useLocalStorage - 本地存储同步

```javascript
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const data = ref(stored ? JSON.parse(stored) : defaultValue)

  watch(data, (newVal) => {
    if (newVal === null || newVal === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(newVal))
    }
  }, { deep: true })

  return data
}
```

**使用：**
```vue
<script setup>
const theme = useLocalStorage('theme', 'light')
const token = useLocalStorage('token', null)
</script>
```

---

## 三、useDebounce - 防抖

```javascript
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debounced = ref(value.value)
  let timeout

  watch(value, (newVal) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debounced.value = newVal
    }, delay)
  })

  return debounced
}
```

**使用：**
```vue
<script setup>
import { ref, watch } from 'vue'

const search = ref('')
const debouncedSearch = useDebounce(search)

watch(debouncedSearch, (val) => {
  fetchResults(val) // 防抖后执行
})
</script>
```

---

## 四、useIntersectionObserver - 视口检测

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(options = {}) {
  const target = ref(null)
  const isIntersecting = ref(false)

  let observer

  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      isIntersecting.value = entry.isIntersecting
    }, options)

    if (target.value) {
      observer.observe(target.value)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { target, isIntersecting }
}
```

**使用：**
```vue
<script setup>
const { target, isIntersecting } = useIntersectionObserver({ threshold: 0.5 })

watch(isIntersecting, (visible) => {
  if (visible) loadMore()
})
</script>

<template>
  <div ref="target">Load more when visible</div>
</template>
```

---

## 五、useClipboard - 剪贴板

```javascript
import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)
  let timeout

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      clearTimeout(timeout)
      timeout = setTimeout(() => copied.value = false, 2000)
      return true
    } catch (e) {
      copied.value = false
      return false
    }
  }

  return { copy, copied }
}
```

**使用：**
```vue
<script setup>
const { copy, copied } = useClipboard()
</script>

<template>
  <button @click="copy('Hello')">
    {{ copied ? 'Copied!' : 'Copy' }}
  </button>
</template>
```

---

## 六、总结速查

```javascript
// 数据获取
const { data, loading, error, execute } = useFetch(url)

// 本地存储
const value = useLocalStorage('key', defaultValue)

// 防抖
const debounced = useDebounce(refValue, 300)

// 视口检测
const { target, isIntersecting } = useIntersectionObserver()

// 剪贴板
const { copy, copied } = useClipboard()
```

---

**相关文章：**
- 上一篇：[Composables 设计模式](./vue-composables-pattern.md)
- 下一篇：[VueUse 库深度使用](./vue-vueuse.md)

**参考：**
- [VueUse](https://vueuse.org/)
