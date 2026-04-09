# Nuxt 3 入门到实战指南

> Vue 生态的全栈框架：SSR、SSG、API 路由一站式解决方案

## Nuxt 3 核心特性

Nuxt 3 是基于 Vue 3 的全栈框架，提供：

| 特性 | 说明 |
|------|------|
| **SSR/SSG/CSR** | 支持多种渲染模式 |
| **自动导入** | 组件、API、组合式函数 |
| **文件路由** | 基于目录结构的路由 |
| **API 路由** | 内置 Nitro 后端引擎 |
| **TypeScript** | 原生支持，零配置 |
| **Vite** | 默认构建工具，极速 HMR |

---

## 快速开始

### 创建项目

```bash
npx nuxi@latest init my-app
cd my-app
npm install
npm run dev
```

### 项目结构

```
my-app/
├── .nuxt/           # 自动生成（构建产物）
├── .output/         # 生产构建输出
├── assets/          # 未编译资源（CSS、字体）
├── components/      # 组件（自动导入）
├── composables/     # 组合式函数（自动导入）
├── layouts/         # 布局
├── middleware/      # 路由中间件
├── pages/           # 页面（自动生成路由）
├── plugins/         # 插件
├── public/          # 静态文件
├── server/          # API 路由、服务端逻辑
├── utils/           # 工具函数（自动导入）
├── app.vue          # 应用入口
├── nuxt.config.ts   # 配置文件
└── package.json
```

---

## 路由系统

### 文件路由约定

```
pages/
├── index.vue              # 首页 /
├── about.vue              # /about
├── users/
│   ├── index.vue          # /users
│   ├── [id].vue           # /users/:id (动态路由)
│   └── profile.vue        # /users/profile
├── [...slug].vue          # 404 捕获 /a/b/c
└── admin/
    └── [[version]].vue    # 可选参数 /admin 或 /admin/v2
```

### 动态路由

```vue
<!-- pages/users/[id].vue -->
<template>
  <div>
    <h1>用户详情</h1>
    <p>ID: {{ $route.params.id }}</p>
    <!-- 或使用组合式 API -->
    <p>ID: {{ userId }}</p>
  </div>
</template>

<script setup>
const route = useRoute()
const userId = route.params.id  // 字符串

// 转换为数字
const userIdNum = computed(() => parseInt(route.params.id))

// 获取数据
const { data: user } = await useFetch(`/api/users/${userId}`)
</script>
```

### 嵌套路由

```
pages/
├── users.vue              # 父布局
└── users/
    ├── index.vue          # /users
    └── [id].vue           # /users/:id
```

```vue
<!-- pages/users.vue -->
<template>
  <div>
    <nav>用户导航</nav>
    <!-- 子路由出口 -->
    <NuxtPage />
  </div>
</template>
```

### 路由中间件

```js
// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  
  // 未登录跳转登录页
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})

// middleware/admin.js
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  
  if (user.value?.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
})
```

```vue
<!-- 页面中使用 -->
<script setup>
definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
```

---

## 数据获取

### useFetch

服务端和客户端通用的数据获取：

```vue
<script setup>
// 基础用法
const { data, pending, error, refresh } = await useFetch('/api/posts')

// 带参数
const { data: posts } = await useFetch('/api/posts', {
  query: { page: 1, limit: 10 }
})

// POST 请求
const { data: newPost } = await useFetch('/api/posts', {
  method: 'POST',
  body: { title: 'New Post', content: '...' }
})

// 懒加载（不阻塞导航）
const { data: comments } = await useFetch('/api/comments', {
  lazy: true,
  server: false  // 只在客户端获取
})

// 手动刷新
const refreshData = () => refresh()
</script>
```

### useAsyncData

更底层的数据获取，需要指定 key：

```vue
<script setup>
const { data, pending, error } = await useAsyncData('posts', () => {
  return $fetch('/api/posts')
})

// 依赖响应式数据
const page = ref(1)
const { data } = await useAsyncData(
  () => `posts-${page.value}`,
  () => $fetch('/api/posts', { query: { page: page.value } }),
  {
    watch: [page]  // page 变化时重新获取
  }
)
</script>
```

### 全局状态

```js
// composables/useCounter.js
export const useCounter = () => {
  const count = useState('counter', () => 0)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return {
    count: readonly(count),
    increment,
    decrement
  }
}
```

---

## 渲染模式

### SSR (服务端渲染)

默认模式，每次请求服务端渲染：

```vue
<script setup>
// 服务端获取数据
const { data } = await useFetch('/api/data')  // 服务端执行
</script>
```

### SSG (静态生成)

构建时预渲染：

```js
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/about', '/contact']
    }
  }
})
```

```vue
<script setup>
// 预渲染时获取数据
const { data } = await useFetch('/api/static-data')

// 运行时客户端获取
definePageMeta({
  ssr: false  // 纯客户端渲染此页
})
</script>
```

### ISR (增量静态再生)

```js
// server/api/posts.get.js
export default defineEventHandler(async (event) => {
  // 设置缓存策略
  event.node.res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
  
  return await fetchPosts()
})
```

### 混合渲染

```vue
<!-- pages/dashboard.vue -->
<script setup>
// 服务端渲染骨架
definePageMeta({
  ssr: true
})

// 客户端获取实时数据
const { data: realtime } = useFetch('/api/realtime', {
  server: false  // 只在客户端获取
})
</script>
```

---

## API 路由

### 基础 API

```js
// server/api/hello.get.js
export default defineEventHandler((event) => {
  return {
    message: 'Hello Nuxt!'
  }
})

// server/api/users.post.js
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const user = await createUser(body)
  
  return {
    success: true,
    data: user
  }
})
```

### 动态 API 路由

```js
// server/api/users/[id].get.js
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const user = await getUserById(id)
  
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }
  
  return user
})
```

### 中间件与验证

```js
// server/middleware/auth.js
export default defineEventHandler((event) => {
  const token = getHeader(event, 'authorization')
  
  if (!token) {
    throw createError({ statusCode: 401 })
  }
  
  // 验证 token
  event.context.user = verifyToken(token)
})

// server/api/protected.get.js
export default defineEventHandler((event) => {
  return {
    user: event.context.user
  }
})
```

---

## 部署

### 预设配置

```js
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    // Node.js 服务器
    preset: 'node-server',
    
    // 静态托管
    // preset: 'static',
    
    // Vercel
    // preset: 'vercel',
    
    // Netlify
    // preset: 'netlify'
  }
})
```

### 构建与部署

```bash
# 构建
npm run build

# 预览生产构建
npm run preview

# 生成静态站点
npm run generate
```

---

## 模块生态

### 常用模块

```js
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    'nuxt-icon',
    '@vueuse/nuxt'
  ],
  
  // 模块配置
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css'
  },
  
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  }
})
```

### 创建模块

```js
// modules/my-module/index.js
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'my-module',
    configKey: 'myModule'
  },
  
  defaults: {
    option: 'default'
  },
  
  setup(options, nuxt) {
    // 添加插件
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: resolve('./components')
      })
    })
  }
})
```

---

## 最佳实践

### SEO 优化

```vue
<script setup>
useHead({
  title: '页面标题',
  titleTemplate: '%s - 网站名称',
  meta: [
    { name: 'description', content: '页面描述' },
    { property: 'og:title', content: '标题' },
    { property: 'og:image', content: '/image.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com/page' }
  ]
})

// 结构化数据
useSchemaOrg([
  defineWebSite({
    name: '网站名称'
  }),
  defineWebPage()
])
</script>
```

### 错误处理

```vue
<!-- error.vue（全局错误页）-->
<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.statusMessage }}</p>
    <button @click="handleError">返回首页</button>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>
```

### 加载状态

```vue
<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />  <!-- 顶部进度条 -->
    <NuxtPage />
  </NuxtLayout>
</template>
```

---

## 速查表

| 功能 | 文件位置 |
|------|----------|
| 页面 | `pages/*.vue` |
| API | `server/api/*.js` |
| 中间件 | `middleware/*.js` |
| 布局 | `layouts/*.vue` |
| 组件 | `components/*.vue` |
| 组合式函数 | `composables/*.js` |
| 工具函数 | `utils/*.js` |
| 插件 | `plugins/*.js` |

---

## 相关文章

- 上一篇：[Vite + Vue 3 最佳实践](./vue-vite-best-practices.md)
- 下一篇：Vue 3 与 TypeScript
