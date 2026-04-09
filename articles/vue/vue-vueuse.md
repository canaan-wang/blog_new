# VueUse 库深度使用

> VueUse 是 Vue 生态中必备的工具库，提供了 200+ 个常用 Composables。掌握它能大幅提升开发效率。

---

## 一、VueUse 简介

### 1.1 安装

```bash
npm install @vueuse/core

# 可选：集成库
npm install @vueuse/integrations  # 第三方库集成
npm install @vueuse/router        # Vue Router 相关
npm install @vueuse/firebase      # Firebase 相关
```

### 1.2 基本使用

```vue
<script setup>
import { useMouse, useLocalStorage, useDark } from '@vueuse/core'

const { x, y } = useMouse()
const store = useLocalStorage('my-store', { name: 'Alice' })
const isDark = useDark()
</script>
```

---

## 二、常用 Composables 分类

### 2.1 状态类

```javascript
import { 
  useLocalStorage,    // 本地存储
  useSessionStorage,  // 会话存储
  useRefHistory,      // 状态历史记录
  useDebouncedRef,    // 防抖 ref
  useThrottledRef     // 节流 ref
} from '@vueuse/core'

// useLocalStorage
const theme = useLocalStorage('theme', 'light')

// useRefHistory
const count = ref(0)
const { history, undo, redo } = useRefHistory(count)
// 可以撤销/重做 count 的变更
```

### 2.2 元素类

```javascript
import {
  useMouse,           // 鼠标位置
  useMouseInElement,  // 元素内鼠标位置
  useElementSize,     // 元素尺寸
  useElementVisibility, // 元素可见性
  useIntersectionObserver // 视口交叉
} from '@vueuse/core'

// useElementSize
const el = ref(null)
const { width, height } = useElementSize(el)

// useIntersectionObserver
const target = ref(null)
const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting) loadMore()
  }
)
```

### 2.3 浏览器 API 类

```javascript
import {
  useFetch,           // 数据获取
  useClipboard,       // 剪贴板
  usePermission,      // 权限查询
  useGeolocation,     // 地理位置
  useNetwork,         // 网络状态
  useBattery,         // 电池状态
  useOnline,          // 在线状态
  useFullscreen       // 全屏
} from '@vueuse/core'

// useNetwork
const { isOnline, offlineAt, downlink } = useNetwork()

// useClipboard
const { text, copy, copied, isSupported } = useClipboard()
// copy('Hello') 后 copied 会变成 true

// useFetch
const { data, error, isFetching, abort } = useFetch(url)
```

### 2.4 时间类

```javascript
import {
  useNow,             // 当前时间
  useDateFormat,      // 日期格式化
  useTimeAgo,         // 相对时间
  useInterval,        // 定时器
  useIntervalFn       // 定时执行
} from '@vueuse/core'

// useNow
const now = useNow() // 每秒更新

// useTimeAgo
const timeAgo = useTimeAgo(new Date('2024-01-01'))
// 输出："3 months ago"
```

---

## 三、暗黑模式

```vue
<script setup>
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'vueuse-dark'
})

const toggleDark = useToggle(isDark)
</script>

<template>
  <button @click="toggleDark()">
    {{ isDark ? '🌙 Dark' : '☀️ Light' }}
  </button>
</template>
```

```css
/* CSS 配合 */
.dark {
  --bg: #1a1a1a;
  --text: #ffffff;
}
```

---

## 四、自定义组合

```javascript
// useUser.js - 业务逻辑组合
import { useStorage, useFetch } from '@vueuse/core'
import { computed } from 'vue'

export function useUser() {
  const token = useStorage('token', null)
  const isLoggedIn = computed(() => !!token.value)
  
  const { data: user, execute: fetchUser } = useFetch(
    computed(() => token.value ? '/api/user' : null),
    { immediate: true }
  ).json()
  
  async function login(credentials) {
    const { data } = await useFetch('/api/login', {
      method: 'POST',
      body: credentials
    }).json()
    token.value = data.value?.token
  }
  
  function logout() {
    token.value = null
  }
  
  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    fetchUser
  }
}
```

---

## 五、总结速查

```javascript
// 安装
npm install @vueuse/core

// 常用导入
import {
  useLocalStorage,    // 本地存储
  useMouse,           // 鼠标追踪
  useFetch,           // HTTP 请求
  useElementSize,     // 元素尺寸
  useDark,            // 暗黑模式
  useClipboard,       // 剪贴板
  useNetwork,         // 网络状态
  useTimeAgo,         // 相对时间
  useToggle           // 布尔切换
} from '@vueuse/core'

// 全部功能：https://vueuse.org/functions.html
```

---

**相关文章：**
- 上一篇：[常用 Composables 实现](./vue-common-composables.md)
- 下一篇：[Pinia 完全指南](./vue-pinia-guide.md)

**参考：**
- [VueUse 官方文档](https://vueuse.org/)
