# Vue 3 与 TypeScript 实战指南

> 类型安全的 Vue 开发：从配置到高级类型技巧

## 为什么选择 TypeScript

| 优势 | 说明 |
|------|------|
| **类型安全** | 编译期捕获错误，减少运行时 Bug |
| **智能提示** | 编辑器自动补全、跳转到定义 |
| **重构友好** | 重命名、提取函数更安全 |
| **文档即代码** | 类型声明本身就是接口文档 |

---

## 项目配置

### Vite + Vue 3 + TS 初始化

```bash
npm create vue@latest
# 选择 TypeScript 支持
```

### tsconfig.json 完整配置

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client", "node"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 类型声明文件

```ts
// src/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 环境变量类型
declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'development' | 'production'
        VITE_API_BASE_URL: string
      }
    }
  }
}
```

---

## 组件类型

### 基础组件

```vue
<script setup lang="ts">
// 定义 Props 类型
interface Props {
  title: string
  count?: number
  items: string[]
  user: {
    name: string
    email: string
  }
}

// 默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 定义 Emits
interface Emits {
  (e: 'update', value: string): void
  (e: 'submit', data: { id: number; name: string }): void
}

const emit = defineEmits<Emits>()

// 提交处理
const handleSubmit = () => {
  emit('submit', { id: 1, name: 'Test' })
}
</script>
```

### 复杂 Props 类型

```ts
// types/common.ts
export type ButtonType = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps {
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: string
}

// components/Button.vue
<script setup lang="ts">
import type { ButtonProps } from '@/types/common'

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})
</script>
```

### 泛型组件

```vue
<!-- components/List.vue -->
<script setup lang="ts" generic="T extends { id: string | number }">
interface Props {
  items: T[]
  renderKey?: keyof T
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [item: T]
}>()
</script>

<template>
  <ul>
    <li 
      v-for="item in items" 
      :key="item.id"
      @click="$emit('select', item)"
    >
      <slot :item="item">{{ item[renderKey] }}</slot>
    </li>
  </ul>
</template>
```

```vue
<!-- 使用泛型组件 -->
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'John', email: 'john@example.com' }
]

const handleSelect = (user: User) => {
  console.log(user.name)  // 类型推断为 User
}
</script>

<template>
  <List :items="users" render-key="name" @select="handleSelect">
    <template #default="{ item }">
      {{ item.email }}  <!-- 类型推断正确 -->
    </template>
  </List>
</template>
```

---

## 组合式函数类型

### useFetch 类型封装

```ts
// composables/useApi.ts
import type { UseFetchOptions } from 'nuxt/app'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export function useApi<T>(
  url: string,
  options?: UseFetchOptions<ApiResponse<T>>
) {
  return useFetch<ApiResponse<T>>(url, {
    ...options,
    transform: (response) => {
      if (response.code !== 200) {
        throw new Error(response.message)
      }
      return response.data
    }
  })
}

// 使用
const { data: user } = await useApi<User>('/api/user/1')
// user 类型为 User | null
```

### 可复用逻辑类型

```ts
// composables/useCounter.ts
interface UseCounterOptions {
  min?: number
  max?: number
  step?: number
}

interface UseCounterReturn {
  count: Ref<number>
  increment: () => void
  decrement: () => void
  reset: () => void
}

export function useCounter(
  initial = 0,
  options: UseCounterOptions = {}
): UseCounterReturn {
  const { min = -Infinity, max = Infinity, step = 1 } = options
  
  const count = ref(initial)
  
  const increment = () => {
    count.value = Math.min(count.value + step, max)
  }
  
  const decrement = () => {
    count.value = Math.max(count.value - step, min)
  }
  
  const reset = () => {
    count.value = initial
  }
  
  return {
    count: readonly(count),
    increment,
    decrement,
    reset
  }
}
```

### 事件钩子类型

```ts
// composables/useEventListener.ts
import type { Ref } from 'vue'

export function useEventListener<
  K extends keyof HTMLElementEventMap
>(
  target: Ref<HTMLElement | null>,
  event: K,
  handler: (ev: HTMLElementEventMap[K]) => void
) {
  onMounted(() => {
    target.value?.addEventListener(event, handler)
  })
  
  onUnmounted(() => {
    target.value?.removeEventListener(event, handler)
  })
}

// 使用
type MyEvents = 'click' | 'mouseenter' | 'mouseleave'

const buttonRef = ref<HTMLButtonElement | null>(null)

useEventListener(buttonRef, 'click', (e) => {
  // e 类型自动推断为 MouseEvent
  console.log(e.clientX)
})
```

---

## Store 类型（Pinia）

### 完整类型定义

```ts
// stores/user.ts
import { defineStore } from 'pinia'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

export interface UserState {
  user: User | null
  token: string | null
  isLoading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    token: null,
    isLoading: false
  }),
  
  getters: {
    isLoggedIn: (state): boolean => !!state.user,
    
    isAdmin: (state): boolean => 
      state.user?.role === 'admin',
    
    userDisplayName: (state): string => 
      state.user?.name ?? 'Guest'
  },
  
  actions: {
    async login(credentials: { email: string; password: string }): Promise<void> {
      this.isLoading = true
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        })
        const data: { user: User; token: string } = await response.json()
        this.user = data.user
        this.token = data.token
      } finally {
        this.isLoading = false
      }
    },
    
    logout(): void {
      this.user = null
      this.token = null
    }
  }
})

// Setup Store 写法
export const useCounterStore = defineStore('counter', () => {
  const count = ref<number>(0)
  const doubleCount = computed<number>(() => count.value * 2)
  
  function increment(): void {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

---

## 路由类型

### Vue Router 类型

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 元信息类型
interface RouteMeta {
  requiresAuth: boolean
  roles?: string[]
  title?: string
  layout?: 'default' | 'blank' | 'admin'
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      requiresAuth: false,
      title: '首页',
      layout: 'default'
    } as RouteMeta
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台',
      layout: 'admin'
    } as RouteMeta
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫类型
router.beforeEach((to, from, next) => {
  const meta = to.meta as RouteMeta
  
  if (meta.requiresAuth && !isLoggedIn()) {
    next('/login')
  } else {
    next()
  }
})
```

---

## 高级类型技巧

### 工具类型

```ts
// types/utils.ts

// 可为空
export type Nullable<T> = T | null | undefined

// 部分可选
export type PartialBy<T, K extends keyof T> = 
  Omit<T, K> & Partial<Pick<T, K>>

// 必填字段
export type RequiredBy<T, K extends keyof T> = 
  Omit<T, K> & Required<Pick<T, K>>

// API 响应
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

// 分页数据
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

### Props 提取与继承

```ts
// 从组件提取 Props 类型
import type Button from './Button.vue'

// Vue 3.3+ 方式
import type { ComponentProps } from 'vue-component-type-helpers'
type ButtonProps = ComponentProps<typeof Button>

// 或使用 defineProps 推断
type ExtractProps<T extends abstract new (...args: any) => any> = 
  Omit<InstanceType<T>['$props'], keyof VuePublicInstance['$props']>
```

### 严格的事件类型

```vue
<script setup lang="ts">
// 使用字面量类型确保事件名正确
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:visible': [visible: boolean]
  'submit': [data: FormData]
  'cancel': []
}>()

// 使用元组语法确保参数类型
const handleClick = () => {
  emit('update:modelValue', 'new value')  // ✅
  // emit('update:modelValue', 123)       // ❌ 类型错误
}
</script>
```

---

## 常见类型错误解决

### ref 推断问题

```ts
// ❌ 类型推断为 any[]
const list = ref([])

// ✅ 显式指定类型
const list = ref<string[]>([])

// ✅ 从初始值推断
const list = ref(['a', 'b'])  // Ref<string[]>
```

### reactive 数组问题

```ts
// ❌ 失去响应式连接
const state = reactive({ items: [] })
state.items = newItems  // 可能丢失响应式

// ✅ 使用 ref
const items = ref<Item[]>([])
items.value = newItems

// ✅ 或保持 reactive
const state = reactive({ items: [] as Item[] })
state.items.push(...newItems)
```

### 模板 ref 类型

```vue
<script setup lang="ts">
// 元素 ref
const inputRef = ref<HTMLInputElement | null>(null)

// 组件 ref
const modalRef = ref<InstanceType<typeof BaseModal> | null>(null)

onMounted(() => {
  inputRef.value?.focus()
  modalRef.value?.open()
})
</script>

<template>
  <input ref="inputRef" />
  <BaseModal ref="modalRef" />
</template>
```

---

## 速查表

| 场景 | 写法 |
|------|------|
| Props 类型 | `defineProps<Props>()` |
| Emits 类型 | `defineEmits<Emits>()` |
| 泛型组件 | `generic="T extends {}"` |
| ref 类型 | `ref<Type>(initial)` |
| computed 类型 | `computed<Type>(() => ...)` |
| 事件处理 | `(e: EventType) => void` |
| 模板 ref | `ref<HTMLElement | null>(null)` |

---

## 相关文章

- 上一篇：[Nuxt 3 入门到实战](./vue-nuxt3-guide.md)
- 下一篇：Vue 2 迁移 Vue 3 指南
