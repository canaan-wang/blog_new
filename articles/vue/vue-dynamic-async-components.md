# 动态组件与异步组件

> 动态组件和异步组件让你可以根据条件渲染不同的组件，并实现代码分割，优化应用加载性能。

---

## 一、动态组件

### 1.1 component 元素

```vue
<script setup>
import { ref, shallowRef } from 'vue'
import TabHome from './TabHome.vue'
import TabPosts from './TabPosts.vue'
import TabArchive from './TabArchive.vue'

const currentTab = shallowRef(TabHome)

const tabs = {
  Home: TabHome,
  Posts: TabPosts,
  Archive: TabArchive
}
</script>

<template>
  <div class="demo">
    <button
      v-for="(_, tab) in tabs"
      :key="tab"
      :class="['tab-button', { active: currentTab === tab }]"
      @click="currentTab = tabs[tab]"
    >
      {{ tab }}
    </button>
    
    <!-- 动态组件 -->
    <component :is="currentTab"></component>
  </div>
</template>
```

### 1.2 字符串形式（全局注册）

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import TabHome from './components/TabHome.vue'

const app = createApp(App)

// 全局注册
app.component('TabHome', TabHome)

app.mount('#app')
```

```vue
<template>
  <!-- 可以使用字符串 -->
  <component :is="'TabHome'"></component>
</template>
```

### 1.3 原生 HTML 元素

```vue
<script setup>
const element = 'button'
const dynamicProps = { disabled: false }
</script>

<template>
  <component :is="element" v-bind="dynamicProps">
    Click me
  </component>
</template>
```

---

## 二、KeepAlive

### 2.1 保持组件状态

```vue
<template>
  <!-- 切换组件时保持状态 -->
  <KeepAlive>
    <component :is="currentTab"></component>
  </KeepAlive>
</template>
```

### 2.2 包含/排除组件

```vue
<!-- 只缓存 TabHome 和 TabPosts -->
<KeepAlive :include="['TabHome', 'TabPosts']">
  <component :is="currentTab"></component>
</KeepAlive>

<!-- 排除特定组件 -->
<KeepAlive :exclude="['TabArchive']">
  <component :is="currentTab"></component>
</KeepAlive>

<!-- 限制缓存实例数量 -->
<KeepAlive :max="10">
  <component :is="currentTab"></component>
</KeepAlive>
```

### 2.3 生命周期钩子

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

// 被 KeepAlive 缓存的组件特有
onActivated(() => {
  // 组件被激活时
  console.log('activated')
})

onDeactivated(() => {
  // 组件被停用时
  console.log('deactivated')
})
</script>
```

---

## 三、异步组件

### 3.1 基本用法

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 基本异步组件
const AdminPage = defineAsyncComponent(() =>
  import('./components/AdminPage.vue')
)

// 带选项的异步组件
const AsyncComp = defineAsyncComponent({
  // 工厂函数
  loader: () => import('./Foo.vue'),
  
  // 加载异步组件时使用的组件
  loadingComponent: LoadingComponent,
  
  // 加载失败时使用的组件
  errorComponent: ErrorComponent,
  
  // 在显示 loadingComponent 之前的延迟 | 默认值：200（单位 ms）
  delay: 200,
  
  // 如果提供了 timeout ，并且加载组件的时间超过了设定值，将显示错误组件
  timeout: 3000
})
</script>

<template>
  <AdminPage />
</template>
```

### 3.2 加载和错误状态

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => new Promise((resolve) => {
    setTimeout(() => {
      resolve(import('./HeavyComponent.vue'))
    }, 2000)
  }),
  loadingComponent: {
    template: '<div>Loading...⏳</div>'
  },
  errorComponent: {
    template: '<div>Failed to load 😢</div>'
  },
  delay: 0,
  timeout: 5000
})
</script>

<template>
  <AsyncComponent />
</template>
```

---

## 四、Suspense

### 4.1 与异步组件配合

```vue
<script setup>
import { Suspense } from 'vue'
import AsyncComponent from './AsyncComponent.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorBoundary from './ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <Suspense>
      <!-- 默认内容 -->
      <template #default>
        <AsyncComponent />
      </template>
      
      <!-- 加载状态 -->
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </ErrorBoundary>
</template>
```

### 4.2 异步 setup

```vue
<script setup>
const post = await fetch('/api/post/1').then(r => r.json())
</script>

<template>
  <div>{{ post.title }}</div>
</template>
```

---

## 五、总结速查

```vue
<script setup>
import { shallowRef, defineAsyncComponent } from 'vue'

// 动态组件
const currentTab = shallowRef(TabA)

// 异步组件
const AsyncComp = defineAsyncComponent(() =>
  import('./Component.vue')
)

// 带配置的异步组件
defineAsyncComponent({
  loader: () => import('./Component.vue'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,
  timeout: 3000
})
</script>

<template>
  <!-- 动态组件 -->
  <component :is="currentTab"></component>
  
  <!-- 缓存 -->
  <KeepAlive :include="['TabA']">
    <component :is="currentTab"></component>
  </KeepAlive>
  
  <!-- Suspense -->
  <Suspense>
    <AsyncComp />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```

---

**相关文章**：
- 上一篇：[组件实例与模板引用](./vue-component-refs.md)
- 下一篇：[Composables 设计模式](./vue-composables-pattern.md)

**参考**：
- [Vue 动态组件](https://cn.vuejs.org/guide/essentials/component-basics.html#dynamic-components)
- [Vue 异步组件](https://cn.vuejs.org/guide/components/async.html)
