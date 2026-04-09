# Vue 3 懒加载与代码分割实战

> 优化首屏加载，实现按需加载与智能预加载

## 为什么需要代码分割

现代 Web 应用体积不断增长：
- 框架运行时 + 业务代码 + 第三方库
- 首屏加载时间直接影响用户体验
- 并非所有代码都需要立即执行

**代码分割的目标：**
- 减少首屏 JavaScript 体积
- 按需加载非关键代码
- 利用浏览器缓存策略

---

## 路由懒加载

Vue Router 配合动态 import 实现页面级代码分割。

### 基础用法

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    // 大型管理后台单独打包
    component: () => import('../views/Admin/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
```

### 指定 Chunk 名称

```js
// 使用 webpackChunkName 魔法注释
const routes = [
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue')
  },
  {
    path: '/settings',
    component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue')
  }
]

// 相同 chunk 名称的会打包在一起
// dashboard.a3f2b1c.js
// settings.8d4e2a1.js
```

### 路由分组打包

```js
// 将相关路由打包到同一个 chunk
const routes = [
  {
    path: '/user/profile',
    component: () => import(/* webpackChunkName: "user" */ '../views/User/Profile.vue')
  },
  {
    path: '/user/settings',
    component: () => import(/* webpackChunkName: "user" */ '../views/User/Settings.vue')
  },
  {
    path: '/user/orders',
    component: () => import(/* webpackChunkName: "user" */ '../views/User/Orders.vue')
  }
]
// 结果：user.9a8b7c6d.js (包含所有 User 相关页面)
```

### 预加载策略

```js
// 1. 使用 webpackPrefetch 预取
{
  path: '/cart',
  component: () => import(/* webpackPrefetch: true */ '../views/Cart.vue')
}
// <link rel="prefetch" as="script" href="/js/cart.xxx.js">

// 2. 使用 webpackPreload 预加载
{
  path: '/checkout',
  component: () => import(/* webpackPreload: true */ '../views/Checkout.vue')
}
// <link rel="modulepreload" href="/js/checkout.xxx.js">
```

**prefetch vs preload：**
| 特性 | prefetch | preload |
|------|----------|---------|
| 优先级 | 低（空闲时加载）| 高（尽快加载）|
| 时机 | 当前页面加载完成后 | 当前页面加载时 |
| 用途 | 可能访问的下一页 | 当前页必需资源 |

---

## 组件懒加载

### 异步组件基础

```js
import { defineAsyncComponent } from 'vue'

// 基础用法
const AsyncModal = defineAsyncComponent(() =>
  import('./components/Modal.vue')
)

// 完整配置
const AsyncChart = defineAsyncComponent({
  // 加载器函数
  loader: () => import('./components/HeavyChart.vue'),
  
  // 加载中组件
  loadingComponent: LoadingSpinner,
  
  // 错误组件
  errorComponent: ErrorDisplay,
  
  // 延迟显示 loading（避免闪烁）
  delay: 200,
  
  // 超时时间
  timeout: 3000,
  
  // 错误处理
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      console.log(`重试第 ${attempts} 次`)
      retry()
    } else {
      fail()
    }
  }
})
```

### 条件加载组件

```vue
<template>
  <component :is="chartComponent" :data="chartData" />
</template>

<script setup>
import { shallowRef, watch } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps(['chartType', 'chartData'])
const chartComponent = shallowRef(LoadingSpinner)

watch(() => props.chartType, async (type) => {
  if (type === 'bar') {
    const { default: BarChart } = await import('./BarChart.vue')
    chartComponent.value = BarChart
  } else if (type === 'line') {
    const { default: LineChart } = await import('./LineChart.vue')
    chartComponent.value = LineChart
  } else if (type === 'pie') {
    const { default: PieChart } = await import('./PieChart.vue')
    chartComponent.value = PieChart
  }
}, { immediate: true })
</script>
```

### v-if 懒加载

```vue
<template>
  <button @click="showModal = true">打开弹窗</button>
  
  <!-- 点击后才加载 Modal 组件 -->
  <Modal v-if="showModal" @close="showModal = false" />
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'

const showModal = ref(false)

// 弹窗组件懒加载
const Modal = defineAsyncComponent(() =>
  import('./Modal.vue')
)
</script>
```

---

## 第三方库懒加载

### 按需加载大型库

```js
// ❌ 全量导入（体积大）
import * as echarts from 'echarts'

// ✅ 按需导入 + 懒加载
async function initChart(container) {
  const { init } = await import('echarts/core')
  const { BarChart } = await import('echarts/charts')
  const { GridComponent, TooltipComponent } = await import('echarts/components')
  const { CanvasRenderer } = await import('echarts/renderers')
  
  init.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])
  
  const chart = init(container)
  chart.setOption({ /* ... */ })
  return chart
}
```

### 功能级懒加载

```js
// utils/export.js
export async function exportToExcel(data, filename) {
  // 只在导出时才加载 xlsx 库
  const XLSX = await import('xlsx')
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// utils/pdf.js
export async function generatePDF(content) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  // ...
  return doc
}
```

### 插件懒加载

```js
// plugins/editor.js
import { ref, markRaw } from 'vue'

export function useRichEditor() {
  const editor = ref(null)
  const EditorComponent = ref(null)
  
  async function loadEditor() {
    if (EditorComponent.value) return
    
    // 懒加载编辑器组件
    const [{ default: Editor }, { default: Quill }] = await Promise.all([
      import('./RichEditor.vue'),
      import('quill')
    ])
    
    EditorComponent.value = markRaw(Editor)
    return Quill
  }
  
  return {
    editor,
    EditorComponent,
    loadEditor
  }
}
```

---

## 图片与资源懒加载

### 图片懒加载指令

```js
// directives/lazy.js
export const vLazy = {
  mounted(el, binding) {
    const src = binding.value
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = new Image()
          img.onload = () => {
            el.src = src
            el.classList.add('loaded')
          }
          img.src = src
          observer.unobserve(el)
        }
      })
    }, {
      rootMargin: '50px'
    })
    
    el._lazyObserver = observer
    observer.observe(el)
  },
  
  unmounted(el) {
    el._lazyObserver?.disconnect()
  }
}
```

```vue
<template>
  <img 
    v-lazy="item.imageUrl" 
    :src="placeholder" 
    :alt="item.title"
  />
</template>
```

### 背景图片懒加载

```vue
<template>
  <div v-lazy-bg="bgImage" class="hero"></div>
</template>

<style>
.hero {
  background-image: url('/placeholder.jpg');
  background-size: cover;
  transition: opacity 0.3s;
}
.hero.loaded {
  opacity: 1;
}
</style>
```

```js
// directives/lazyBg.js
export const vLazyBg = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = new Image()
          img.onload = () => {
            el.style.backgroundImage = `url(${binding.value})`
            el.classList.add('loaded')
          }
          img.src = binding.value
          observer.unobserve(el)
        }
      })
    })
    observer.observe(el)
    el._bgObserver = observer
  },
  unmounted(el) {
    el._bgObserver?.disconnect()
  }
}
```

---

## 预加载策略

### 智能预加载

```js
// composables/usePreload.js
export function usePreload() {
  const preloaded = new Set()
  
  function preloadComponent(importer) {
    if (preloaded.has(importer)) return
    
    preloaded.add(importer)
    // 使用 requestIdleCallback 在空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importer(), { timeout: 2000 })
    } else {
      setTimeout(importer, 1000)
    }
  }
  
  function preloadOnHover(el, importer) {
    const handler = () => {
      preloadComponent(importer)
      el.removeEventListener('mouseenter', handler)
    }
    el.addEventListener('mouseenter', handler)
  }
  
  return { preloadComponent, preloadOnHover }
}

// 使用
const { preloadOnHover } = usePreload()

onMounted(() => {
  // 鼠标悬停时预加载
  const link = document.querySelector('a[href="/admin"]')
  preloadOnHover(link, () => import('../views/Admin.vue'))
})
```

### 路由预加载

```js
// router/index.js
router.beforeEach((to, from, next) => {
  // 预加载可能访问的下一页
  if (to.path === '/product') {
    import('../views/Cart.vue')  // 用户可能去购物车
  }
  next()
})
```

---

## Vite 优化配置

### 手动分割 Chunks

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 生态打包在一起
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          
          // UI 库单独打包
          'ui-vendor': ['element-plus'],
          
          // 工具库
          'utils': ['lodash-es', 'dayjs', 'axios']
        }
      }
    },
    // 代码分割大小限制
    chunkSizeWarningLimit: 1000
  }
})
```

### 动态导入优化

```js
// vite.config.js
export default defineConfig({
  build: {
    // 动态导入的模块输出格式
    dynamicImportVarsOptions: {
      warnOnError: true,
      exclude: [/node_modules/]
    },
    // 资源内联阈值
    assetsInlineLimit: 4096
  }
})
```

---

## 性能监控

### 加载时间追踪

```js
// 追踪异步组件加载时间
const AsyncComp = defineAsyncComponent({
  loader: () => {
    const start = performance.now()
    return import('./HeavyComponent.vue').then(module => {
      const end = performance.now()
      console.log(`组件加载耗时: ${end - start}ms`)
      return module
    })
  }
})
```

### 错误监控

```js
// main.js
app.config.errorHandler = (err, vm, info) => {
  // 记录异步加载错误
  if (err.message?.includes('Failed to fetch dynamically imported module')) {
    console.error('模块加载失败:', err)
    // 上报监控
  }
}
```

---

## 最佳实践总结

### ✅ Do

1. **路由级分割**：每个路由页面单独 chunk
2. **组件级懒加载**：Modal、Chart 等大型组件
3. **功能级分割**：导出、打印等非核心功能
4. **合理分组**：相关功能打包在一起
5. **智能预加载**：hover 时预加载、空闲时预取

### ❌ Don't

1. 过度分割：每个组件都懒加载（增加请求数）
2. 关键路径懒加载：首屏必需内容立即加载
3. 忽略错误处理：异步加载可能失败
4. 忘记清理：路由切换时取消未完成的加载

---

## 速查表

| 场景 | 方案 |
|------|------|
| 路由页面 | `() => import('./Page.vue')` |
| 大型组件 | `defineAsyncComponent()` |
| 第三方库 | 按需导入 + 动态 import |
| 图片 | IntersectionObserver + v-lazy |
| 功能模块 | 函数内动态 import |
| 预加载 | `webpackPrefetch` / hover 触发 |

---

## 相关文章

- 上一篇：[Vue 3 性能优化实战](./vue-performance-optimization.md)
- 下一篇：大规模列表优化
