# 生命周期钩子

> 生命周期钩子让你在组件的不同阶段执行代码。Vue 3 的生命周期钩子与 Vue 2 有所不同，特别是在 Composition API 中的使用方式。

---

## 一、生命周期图示

```
                    创建
                      ↓
              ┌───────────────┐
              │    setup()    │  ← Composition API 入口
              └───────┬───────┘
                      ↓
              ┌───────────────┐
      ┌───────│  beforeCreate │───────┐
      │       │    created    │       │
      │       └───────┬───────┘       │
      │               ↓               │
      │       ┌───────────────┐       │
      │       │ beforeMount   │       │
      │       │    mounted    │◄──────┼── DOM 已挂载
      │       └───────┬───────┘       │
      │               ↓               │
      │       ┌───────────────┐       │
      ├──────►│ beforeUpdate  │       │
      │       │    updated    │◄──────┼── DOM 已更新
      │       └───────┬───────┘       │
      │               ↓               │
      │       ┌───────────────┐       │
      └──────►│  beforeUnmount│       │
              │   unmounted   │◄──────┘── DOM 已移除
              └───────────────┘
```

---

## 二、Composition API 中的生命周期

### 2.1 基本钩子

```vue
<script setup>
import { 
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted 
} from 'vue'

// 挂载阶段
onBeforeMount(() => {
  console.log('DOM 挂载前')
})

onMounted(() => {
  console.log('DOM 已挂载')
  // 可以访问 DOM 元素、初始化图表等
})

// 更新阶段
onBeforeUpdate(() => {
  console.log('DOM 更新前')
})

onUpdated(() => {
  console.log('DOM 已更新')
})

// 卸载阶段
onBeforeUnmount(() => {
  console.log('组件卸载前')
  // 清理定时器、事件监听等
})

onUnmounted(() => {
  console.log('组件已卸载')
})
</script>
```

### 2.2 其他钩子

```vue
<script setup>
import { 
  onErrorCaptured,  // 错误捕获
  onRenderTracked,  // 开发调试：依赖追踪
  onRenderTriggered // 开发调试：重新渲染触发
} from 'vue'

// 错误处理
onErrorCaptured((err, instance, info) => {
  console.error('捕获错误:', err, info)
  // 返回 false 阻止错误继续传播
  return false
})

// 调试钩子（开发模式）
onRenderTracked((event) => {
  console.log('追踪到依赖:', event)
})

onRenderTriggered((event) => {
  console.log('触发重新渲染:', event)
})
</script>
```

---

## 三、Options API vs Composition API

| Options API | Composition API | 说明 |
|-------------|-----------------|------|
| beforeCreate | ❌ 不需要 | setup 替代 |
| created | ❌ 不需要 | setup 替代 |
| beforeMount | onBeforeMount | |
| mounted | onMounted | |
| beforeUpdate | onBeforeUpdate | |
| updated | onUpdated | |
| beforeUnmount | onBeforeUnmount | Vue 3 改名（原 beforeDestroy）|
| unmounted | onUnmounted | Vue 3 改名（原 destroyed）|
| errorCaptured | onErrorCaptured | |
| renderTracked | onRenderTracked | Vue 3 新增 |
| renderTriggered | onRenderTriggered | Vue 3 新增 |

---

## 四、setup 与生命周期

```vue
<script setup>
import { ref, onMounted } from 'vue'

// setup 执行时相当于 beforeCreate + created
console.log('组件初始化')

const count = ref(0)

// 可以多次调用同一钩子
onMounted(() => {
  console.log('第一个 mounted 钩子')
})

onMounted(() => {
  console.log('第二个 mounted 钩子')
})
</script>
```

---

## 五、常见使用场景

### 5.1 初始化数据

```vue
<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/api/users')
    users.value = await res.json()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>
```

### 5.2 清理副作用

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timer = ref(null)
const count = ref(0)

onMounted(() => {
  timer.value = setInterval(() => {
    count.value++
  }, 1000)
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(timer.value)
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  // ...
}
</script>
```

### 5.3 异步 setup

```vue
<script setup>
import { ref, onMounted } from 'vue'

const post = ref(null)

// 顶层 await 会导致组件处于 Suspense 状态
const res = await fetch('/api/post/1')
post.value = await res.json()

// 如需等待挂载后再请求，使用 onMounted
onMounted(async () => {
  // 此时 DOM 已准备好
})
</script>
```

---

## 六、父子组件生命周期顺序

```
父 beforeMount
  子 beforeMount
  子 mounted
父 mounted

父 beforeUpdate
  子 beforeUpdate
  子 updated
父 updated

父 beforeUnmount
  子 beforeUnmount
  子 unmounted
父 unmounted
```

---

## 七、总结速查

```javascript
import { 
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted,
  onErrorCaptured
} from 'vue'

// 挂载
onBeforeMount(() => {})
onMounted(() => {})      // DOM 操作、数据获取

// 更新
onBeforeUpdate(() => {})
onUpdated(() => {})

// 卸载
onBeforeUnmount(() => {}) // 清理副作用
onUnmounted(() => {})

// 错误
onErrorCaptured((err, instance, info) => {})
```

---

**相关文章**：
- 上一篇：[计算属性与侦听器](./vue-computed-watchers.md)
- 下一篇：[Props 与 Emits](./vue-props-emits.md)

**参考**：
- [Vue 生命周期](https://cn.vuejs.org/guide/essentials/lifecycle.html)
