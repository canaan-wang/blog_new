# Vue 3 大规模列表优化指南

> 虚拟滚动、分页、无限滚动：海量数据渲染解决方案

## 列表性能问题分析

当数据量增大时，列表渲染面临三大问题：

| 问题 | 原因 | 影响 |
|------|------|------|
| 内存占用 | 所有 DOM 节点常驻内存 | 页面卡顿、崩溃 |
| 渲染耗时 | 大量节点同步渲染 | 白屏、交互延迟 |
| 滚动性能 | 重排重绘频繁 | 滚动掉帧 |

**数据参考：**
- 1000 条数据：无明显问题
- 5000 条数据：开始感知延迟
- 10000+ 条数据：必须优化

---

## 方案一：虚拟滚动

只渲染可视区域内的元素，滚动时动态替换内容。

### vue-virtual-scroller 使用

```bash
npm install vue-virtual-scroller
```

```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="list"
    :item-size="50"
    key-field="id"
    v-slot="{ item, index }"
  >
    <div class="item">
      <span class="index">{{ index }}</span>
      <span class="name">{{ item.name }}</span>
    </div>
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const list = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  // ... 10000+ 条
]
</script>

<style scoped>
.scroller {
  height: 400px;
}
.item {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
</style>
```

**核心原理：**
- 容器固定高度，设置 `overflow: auto`
- 计算可见区域起始索引：`startIndex = scrollTop / itemSize`
- 只渲染可见项 + 缓冲区（通常上下各 5 条）

### 动态高度处理

当列表项高度不固定时：

```vue
<template>
  <DynamicScroller
    class="scroller"
    :items="list"
    :min-item-size="50"
    key-field="id"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.content]"
      >
        <div class="item">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script setup>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
</script>
```

### 原生虚拟滚动实现

```vue
<template>
  <div ref="container" class="virtual-list" @scroll="handleScroll">
    <!-- 占位元素，撑起滚动条 -->
    <div class="phantom" :style="{ height: totalHeight + 'px' }"></div>
    
    <!-- 实际渲染列表 -->
    <div class="content" :style="{ transform: `translateY(${offset}px)` }">
      <div 
        v-for="item in visibleList" 
        :key="item.id"
        class="item"
        :style="{ height: itemHeight + 'px' }"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  list: Array,
  itemHeight: { type: Number, default: 50 },
  buffer: { type: Number, default: 5 }  // 缓冲区数量
})

const container = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(0)

// 总高度
const totalHeight = computed(() => 
  props.list.length * props.itemHeight
)

// 可见区域起始索引
const startIndex = computed(() => 
  Math.floor(scrollTop.value / props.itemHeight)
)

// 可见数量
const visibleCount = computed(() => 
  Math.ceil(containerHeight.value / props.itemHeight)
)

// 实际渲染的起始（加上缓冲区）
const renderStart = computed(() => 
  Math.max(0, startIndex.value - props.buffer)
)

// 实际渲染的结束（加上缓冲区）
const renderEnd = computed(() => 
  Math.min(props.list.length, startIndex.value + visibleCount.value + props.buffer)
)

// 可见列表数据
const visibleList = computed(() => 
  props.list.slice(renderStart.value, renderEnd.value)
)

// 偏移量
const offset = computed(() => 
  renderStart.value * props.itemHeight
)

function handleScroll(e) {
  scrollTop.value = e.target.scrollTop
}

onMounted(() => {
  containerHeight.value = container.value?.clientHeight || 0
})
</script>

<style scoped>
.virtual-list {
  position: relative;
  height: 400px;
  overflow: auto;
}
.phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}
.content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}
</style>
```

---

## 方案二：分页加载

经典的分页方案，适合需要跳转到特定页的场景。

### 基础分页组件

```vue
<template>
  <div class="pagination-list">
    <div class="list">
      <div v-for="item in displayList" :key="item.id" class="item">
        {{ item.name }}
      </div>
    </div>
    
    <div class="pagination">
      <button 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >上一页</button>
      
      <span>{{ currentPage }} / {{ totalPages }}</span>
      
      <button 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  list: Array,
  pageSize: { type: Number, default: 20 }
})

const currentPage = ref(1)

const totalPages = computed(() => 
  Math.ceil(props.list.length / props.pageSize)
)

const displayList = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return props.list.slice(start, end)
})
</script>
```

### 服务端分页

```vue
<script setup>
import { ref, watch } from 'vue'

const currentPage = ref(1)
const pageSize = ref(20)
const list = ref([])
const total = ref(0)
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const { data } = await fetch('/api/list', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

watch(currentPage, fetchData, { immediate: true })
</script>
```

---

## 方案三：无限滚动

适合信息流、时间线等场景。

### 基础实现

```vue
<template>
  <div ref="container" class="infinite-list" @scroll="handleScroll">
    <div v-for="item in list" :key="item.id" class="item">
      {{ item.name }}
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    <div v-if="finished" class="finished">没有更多了</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const container = ref(null)
const list = ref([])
const page = ref(1)
const loading = ref(false)
const finished = ref(false)

async function loadMore() {
  if (loading.value || finished.value) return
  
  loading.value = true
  const data = await fetchData(page.value)
  
  if (data.length === 0) {
    finished.value = true
  } else {
    list.value.push(...data)
    page.value++
  }
  
  loading.value = false
}

function handleScroll() {
  const el = container.value
  const { scrollTop, scrollHeight, clientHeight } = el
  
  // 距离底部 100px 时加载
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMore()
  }
}

onMounted(() => {
  loadMore()
})
</script>
```

### Intersection Observer 实现

```vue
<template>
  <div class="infinite-list">
    <div v-for="item in list" :key="item.id" class="item">
      {{ item.name }}
    </div>
    
    <!-- 触发器元素 -->
    <div ref="trigger" class="trigger">
      {{ loading ? '加载中...' : finished ? '没有更多了' : '' }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const list = ref([])
const page = ref(1)
const loading = ref(false)
const finished = ref(false)
const trigger = ref(null)

async function loadMore() {
  if (loading.value || finished.value) return
  
  loading.value = true
  const data = await fetchData(page.value)
  
  if (data.length === 0) {
    finished.value = true
  } else {
    list.value.push(...data)
    page.value++
  }
  
  loading.value = false
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore()
    }
  }, {
    rootMargin: '100px'
  })
  
  if (trigger.value) {
    observer.observe(trigger.value)
  }
})
</script>
```

---

## 方案对比与选择

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| 虚拟滚动 | 万级数据、需要频繁滚动 | 内存占用恒定、滚动流畅 | 实现复杂、需固定/预估高度 |
| 分页 | 需跳转到特定页、SEO 友好 | 简单直观、可分享链接 | 需要用户交互 |
| 无限滚动 | 信息流、时间线 | 体验自然 | 难定位、难跳转 |

---

## 进阶优化

### 列表项复用

```vue
<template>
  <RecycleScroller
    class="scroller"
    :items="list"
    :item-size="80"
    key-field="id"
  >
    <template #default="{ item, index, active }">
      <ListItem
        :item="item"
        :index="index"
        :active="active"
      />
    </template>
  </RecycleScroller>
</template>

<script setup>
import { RecycleScroller } from 'vue-virtual-scroller'
import ListItem from './ListItem.vue'

// ListItem.vue 中使用 active 控制更新
// 只有 active=true（在可视区域）时才加载图片等
</script>
```

### 图片懒加载结合

```vue
<template>
  <div v-for="item in visibleList" :key="item.id" class="item">
    <img v-lazy="item.image" :src="placeholder" />
    <div class="content">
      <h4>{{ item.title }}</h4>
      <p>{{ item.description }}</p>
    </div>
  </div>
</template>

<script setup>
// v-lazy 指令：IntersectionObserver 实现
// 图片只在进入可视区域时加载
</script>
```

### 搜索与筛选优化

```js
import { ref, computed, watch } from 'vue'

const allData = ref([])  // 全部数据
const keyword = ref('')
const filters = ref({ category: '', status: '' })

// 使用 computed 缓存筛选结果
const filteredList = computed(() => {
  return allData.value.filter(item => {
    if (keyword.value && !item.name.includes(keyword.value)) {
      return false
    }
    if (filters.value.category && item.category !== filters.value.category) {
      return false
    }
    return true
  })
})

// 防抖处理搜索
import { debounce } from 'lodash-es'
const debouncedSearch = debounce((val) => {
  keyword.value = val
}, 300)
```

---

## 性能指标监控

```js
// 监控列表渲染性能
function measureListPerformance() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure' && entry.name === 'list-render') {
        console.log(`列表渲染耗时: ${entry.duration}ms`)
        
        // 超过 16ms 即可能掉帧
        if (entry.duration > 16) {
          console.warn('渲染性能需优化')
        }
      }
    }
  })
  
  observer.observe({ entryTypes: ['measure'] })
}

// 使用
performance.mark('render-start')
// ... 渲染操作
performance.mark('render-end')
performance.measure('list-render', 'render-start', 'render-end')
```

---

## 速查表

| 数据规模 | 推荐方案 |
|----------|----------|
| < 100 | 直接渲染 |
| 100 - 1000 | v-for + 分页 |
| 1000 - 5000 | 无限滚动 |
| 5000+ | 虚拟滚动 |

---

## 相关文章

- 上一篇：[Vue 3 懒加载与代码分割](./vue-lazy-loading.md)
- 下一篇：Vite + Vue 3 最佳实践
