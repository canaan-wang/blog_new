# Vue 3 性能优化实战指南

> 从编译优化到运行时调优，打造高性能 Vue 应用

## 编译时优化

Vue 3 的编译器在构建阶段做了大量优化工作。

### PatchFlag 静态标记

Vue 3 编译器会分析模板，给动态节点打上标记：

```vue
<template>
  <div class="static" :class="dynamicClass">
    <span>{{ staticText }}</span>
    <span>{{ dynamicText }}</span>
  </div>
</template>
```

编译后（简化）：

```js
// 静态内容提升
const _hoisted_1 = _createElementVNode("span", null, "静态文本", -1 /* HOISTED */)

function render(_ctx, _cache) {
  return _openBlock(), _createElementBlock("div", {
    class: _normalizeClass(["static", _ctx.dynamicClass])
  }, [
    _hoisted_1,  // 静态节点直接复用
    _createElementVNode("span", null, _toDisplayString(_ctx.dynamicText), 1 /* TEXT */)
    // ^ PatchFlag 标记：只有 TEXT 会变
  ])
}
```

**PatchFlag 类型：**

| Flag | 值 | 含义 |
|------|-----|------|
| TEXT | 1 | 动态文本内容 |
| CLASS | 2 | 动态 class |
| STYLE | 4 | 动态 style |
| PROPS | 8 | 动态属性（不包括 class/style）|
| FULL_PROPS | 16 | 动态 key，需要完整 diff |
| HYDRATE_EVENTS | 32 | 事件监听器 |
| STABLE_FRAGMENT | 64 | 子节点顺序不变的 Fragment |
| KEYED_FRAGMENT | 128 | 带 key 的 Fragment |
| UNKEYED_FRAGMENT | 256 | 不带 key 的 Fragment |
| NEED_PATCH | 512 | 需要强制 patch |

### Block Tree 块树优化

Vue 3 采用动态节点收集策略，只对比标记为动态的节点：

```vue
<template>
  <div>
    <p>静态内容</p>
    <p v-if="show">条件内容</p>
    <p :class="activeClass">动态 class</p>
  </div>
</template>
```

编译结果：

```js
function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", null, [
    _createElementVNode("p", null, "静态内容"),
    // Block 收集动态子节点
    (_ctx.show)
      ? (_openBlock(), _createElementBlock("p", { key: 0 }, "条件内容"))
      : _createCommentVNode("v-if", true),
    _createElementVNode("p", {
      class: _normalizeClass(_ctx.activeClass)
    }, "动态 class", 2 /* CLASS */)
  ]))
}
```

**优化原理：**
- 静态节点直接从 Virtual DOM 树中排除
- diff 算法只遍历动态节点，时间复杂度从 O(n) 降到 O(动态节点数)

---

## 运行时优化

### 1. v-memo 缓存

Vue 3.2+ 引入的细粒度缓存指令。

```vue
<template>
  <div v-memo="[item.id, selected]">
    <!-- 只有 item.id 或 selected 变化时才重新渲染 -->
    <h3>{{ item.title }}</h3>
    <p>{{ item.content }}</p>
    <span>{{ selected ? '已选中' : '未选中' }}</span>
  </div>
</template>
```

**适用场景：**
- 大数据列表中某行数据很少变化
- 复杂计算结果的展示组件
- 需要跳过不必要的子树更新

**列表中使用 v-memo：**

```vue
<div v-for="item in list" :key="item.id" v-memo="[item.name]">
  <!-- 只有 item.name 变化才更新 -->
  <UserCard :user="item" />
</div>
```

### 2. 浅层响应式

当不需要深层响应时，使用 shallow API 减少 Proxy 开销。

```js
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// 大数据对象，只监听 .value 变化，不监听内部属性
const hugeData = shallowRef({
  users: [...10000条数据],
  metadata: { ... }
})

// 修改内部属性不会触发更新
hugeData.value.users.push(newUser)  // 无响应

// 需要更新时手动触发
hugeData.value = { ...hugeData.value }  // 触发更新
// 或
triggerRef(hugeData)  // 强制触发
```

```js
// 场景：Canvas/WebGL 状态
const canvasState = shallowReactive({
  gl: null,           // WebGL 上下文
  buffers: [],        // GPU 缓冲区
  shaders: new Map()  // 着色器程序
})

// 直接赋值不会触发响应
 canvasState.gl = glContext  // 会触发（第一层）
canvasState.buffers.push(buffer)  // 不会触发（深层）
```

### 3. markRaw 跳过响应式

标记对象永远不应成为响应式。

```js
import { markRaw, reactive } from 'vue'

const state = reactive({
  // 第三方库实例不需要响应式
  chart: markRaw(new Chart(ctx, options)),
  
  // 大量静态数据
  dictionary: markRaw({
    /* 10000+ 条词条 */
  })
})

// 访问 state.chart 不会建立代理
state.chart.update()  // 直接操作，无响应式开销
```

### 4. 组件冻结

对于纯展示组件，可以使用 `freeze` 阻止 Vue 添加响应式：

```js
const staticData = Object.freeze([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  // ...
])
```

---

## 列表渲染优化

### key 的正确使用

```vue
<!-- ❌ 错误：使用 index 作为 key -->
<div v-for="(item, index) in list" :key="index">
  {{ item.name }}
</div>

<!-- ✅ 正确：使用唯一标识 -->
<div v-for="item in list" :key="item.id">
  {{ item.name }}
</div>
```

### 虚拟滚动

大数据列表必用方案。

```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="list"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="item">
      {{ item.name }}
    </div>
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
</script>
```

### 分页与无限滚动

```vue
<template>
  <div ref="listRef" @scroll="handleScroll">
    <Item v-for="item in displayList" :key="item.id" :data="item" />
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="noMore" class="no-more">没有更多了</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const list = ref([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const noMore = ref(false)

const displayList = computed(() => {
  // 只渲染当前可见的数据
  return list.value.slice(0, page.value * pageSize)
})

const loadMore = async () => {
  if (loading.value || noMore.value) return
  
  loading.value = true
  const newData = await fetchData(page.value)
  
  if (newData.length === 0) {
    noMore.value = true
  } else {
    list.value.push(...newData)
    page.value++
  }
  loading.value = false
}

// 触底检测
const listRef = ref(null)
const { stop } = useIntersectionObserver(
  listRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) loadMore()
  },
  { rootMargin: '100px' }
)
</script>
```

---

## 组件优化

### 1. 异步组件

```js
import { defineAsyncComponent } from 'vue'

// 基础用法
const AdminPanel = defineAsyncComponent(() =>
  import('./AdminPanel.vue')
)

// 带加载状态和错误处理
const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,        // 延迟显示 loading，避免闪烁
  timeout: 3000      // 超时时间
})
```

### 2. KeepAlive 缓存

```vue
<KeepAlive :include="['TabA', 'TabB']" :exclude="['TabC']" :max="10">
  <component :is="activeTab" />
</KeepAlive>
```

```vue
<script setup>
export default {
  name: 'TabA'  // 用于 include/exclude 匹配
}

// 控制缓存行为
onActivated(() => {
  // 组件激活时刷新数据
})

onDeactivated(() => {
  // 组件停用时清理资源
})
</script>
```

### 3. Suspense 异步依赖

```vue
<Suspense>
  <template #default>
    <AsyncDashboard />  <!-- 包含异步 setup 的组件 -->
  </template>
  
  <template #fallback>
    <LoadingSkeleton />
  </template>
</Suspense>
```

---

## 计算属性与侦听器优化

### computed 缓存

```js
// ❌ 错误：每次渲染都重新计算
const filtered = computed(() => {
  return hugeList.value
    .filter(item => item.active)
    .map(item => expensiveTransform(item))
})

// ✅ 正确：配合其他 computed 拆分
const activeItems = computed(() => 
  hugeList.value.filter(item => item.active)
)

const transformed = computed(() =>
  activeItems.value.map(item => expensiveTransform(item))
)
```

### watch 优化

```js
// ❌ 深度监听大数据
watch(hugeObject, callback, { deep: true })

// ✅ 只监听需要的属性
watch(() => hugeObject.value.specificField, callback)

// ✅ 使用 flush: 'post' 避免重复渲染
watch(source, callback, { flush: 'post' })
```

---

## 渲染优化

### 1. v-show vs v-if

```vue
<!-- 频繁切换用 v-show -->
<Tab v-show="activeTab === 'a'" />
<Tab v-show="activeTab === 'b'" />

<!-- 条件不常变用 v-if -->
<AdminPanel v-if="isAdmin" />
```

### 2. 避免不必要的组件渲染

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps(['items'])

// ❌ 每次父组件更新都重新计算
const sorted = computed(() => [...props.items].sort())

// ✅ 使用 toRaw 避免不必要的依赖追踪
import { toRaw } from 'vue'
const sorted = computed(() => {
  // 只在 items 引用变化时重新计算
  return [...toRaw(props.items)].sort()
})
</script>
```

### 3. CSS 优化

```vue
<style scoped>
/* 使用 contain 提升渲染性能 */
.list-container {
  contain: layout style paint;
}

/* 使用 content-visibility 延迟离屏渲染 */
.card {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
</style>
```

---

## 内存优化

### 1. 及时清理副作用

```js
import { onUnmounted } from 'vue'

const timer = setInterval(() => {
  // 定时任务
}, 1000)

const handler = () => console.log('resize')
window.addEventListener('resize', handler)

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', handler)
})
```

### 2. 使用 WeakMap/WeakSet

```js
// 组件外部缓存，不阻止 GC
const cache = new WeakMap()

function getComputedData(obj) {
  if (!cache.has(obj)) {
    cache.set(obj, expensiveCompute(obj))
  }
  return cache.get(obj)
}

// obj 不再被引用时，缓存自动释放
```

---

## 性能检测工具

### Vue DevTools

- **Performance**: 查看组件渲染时间
- **Timeline**: 追踪响应式更新

### Chrome DevTools

```js
// 标记性能测试区间
performance.mark('render-start')
// ... 渲染操作
performance.mark('render-end')
performance.measure('render', 'render-start', 'render-end')
```

### 自定义性能监控

```js
import { nextTick } from 'vue'

async function measureRenderTime(component) {
  const start = performance.now()
  
  component.someReactiveProp = newValue
  await nextTick()
  
  const end = performance.now()
  console.log(`渲染耗时: ${end - start}ms`)
}
```

---

## 速查表

| 优化手段 | 适用场景 |
|----------|----------|
| `v-memo` | 复杂子树，数据变化频率低 |
| `shallowRef/Reactive` | 大数据对象，不需要深层响应 |
| `markRaw` | 第三方库实例、静态数据 |
| `defineAsyncComponent` | 大型组件、路由懒加载 |
| `KeepAlive` | 频繁切换的 Tabs |
| `虚拟滚动` | 万级数据列表 |
| `Object.freeze` | 纯展示静态数据 |

---

## 相关文章

- 上一篇：[Vue 3 响应式原理源码](./vue-reactivity-source.md)
- 下一篇：懒加载与代码分割
