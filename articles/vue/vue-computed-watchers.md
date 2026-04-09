# 计算属性与侦听器

> 计算属性（computed）和侦听器（watch）是处理响应式数据的两大工具。理解它们的区别和适用场景，能帮助你写出更高效、更清晰的代码。

---

## 一、计算属性 computed

### 1.1 基本用法

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})

// 等价的函数（每次渲染都执行）
function getFullName() {
  return firstName.value + ' ' + lastName.value
}
</script>

<template>
  <!-- 计算属性：缓存，依赖不变不重新计算 -->
  <p>{{ fullName }}</p>
  
  <!-- 方法：每次渲染都执行 -->
  <p>{{ getFullName() }}</p>
</template>
```

### 1.2 可写计算属性

```javascript
const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})

fullName.value = 'Tom Smith'  // 触发 setter
```

### 1.3 computed vs 方法

| 特性 | computed | method |
|------|----------|--------|
| **缓存** | ✅ 依赖不变返回缓存值 | ❌ 每次调用都执行 |
| **适用** | 基于响应式数据的派生值 | 需要参数或触发副作用 |
| **性能** | 依赖多时更优 | 简单场景也可接受 |

---

## 二、侦听器 watch

### 2.1 基本用法

```vue
<script setup>
import { ref, watch } from 'vue'

const question = ref('')
const answer = ref('Questions usually contain a question mark. 😉')

// 侦听单个源
watch(question, async (newQuestion, oldQuestion) => {
  if (newQuestion.includes('?')) {
    answer.value = 'Thinking...'
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = 'Error! Could not reach the API.'
    }
  }
})
</script>
```

### 2.2 侦听多个源

```javascript
const firstName = ref('')
const lastName = ref('')

// 数组形式侦听多个源
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log('Name changed:', newFirst, newLast)
})

// 对象形式（深度侦听）
const user = ref({ name: 'Alice', age: 25 })

watch(user, (newVal, oldVal) => {
  // 深度侦听，任何属性变化都触发
  console.log('User changed:', newVal)
}, { deep: true })
```

### 2.3 立即执行和一次性侦听

```javascript
// immediate：立即执行一次
watch(source, callback, { immediate: true })

// once：只触发一次（Vue 3.4+）
watch(source, callback, { once: true })

// 条件性触发
watch(
  () => user.value.age,
  (age) => {
    if (age >= 18) {
      console.log('Adult')
    }
  }
)
```

---

## 三、watchEffect

### 3.1 基本用法

```javascript
import { ref, watchEffect } from 'vue'

const todoId = ref(1)
const data = ref(null)

// 立即执行，自动追踪依赖
watchEffect(async () => {
  // 自动追踪 todoId 的依赖
  const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId.value}`)
  data.value = await response.json()
})

// 修改 todoId 会自动重新获取数据
todoId.value = 2
```

### 3.2 watchEffect vs watch

| 特性 | watchEffect | watch |
|------|-------------|-------|
| **立即执行** | ✅ 自动 | 需 `immediate: true` |
| **依赖追踪** | ✅ 自动追踪 | 手动指定源 |
| **旧值访问** | ❌ 无法获取 | ✅ 可以获取 |
| **适用场景** | 副作用与多个状态相关 | 特定状态变化时执行 |

### 3.3 清理副作用

```javascript
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)
  
  // 清理函数：重新执行或停止时调用
  onCleanup(() => {
    clearInterval(timer)
  })
})
```

---

## 四、选择指南

```javascript
// ✅ computed：派生值，无副作用
const total = computed(() => items.value.reduce((sum, item) => sum + item.price, 0))

// ✅ watch：特定状态变化时执行副作用
watch(searchText, () => {
  fetchResults()  // API 调用
})

// ✅ watchEffect：多个状态关联的副作用
watchEffect(() => {
  // 自动追踪所有用到的响应式数据
  localStorage.setItem('cart', JSON.stringify(cart.value))
  localStorage.setItem('user', JSON.stringify(user.value))
})
```

---

## 五、总结速查

```javascript
import { ref, computed, watch, watchEffect } from 'vue'

// 计算属性：缓存、派生值
const derived = computed(() => source.value * 2)

// 可写计算属性
const writable = computed({
  get: () => source.value,
  set: (val) => source.value = val
})

// watch：特定源变化
watch(source, (newVal, oldVal) => { /* ... */ })
watch([a, b], ([newA, newB]) => { /* ... */ }, { deep: true })

// watchEffect：自动追踪依赖
watchEffect(() => {
  // 使用到的响应式数据会自动追踪
  console.log(source.value)
})
```

---

**相关文章**：
- 上一篇：[响应式系统精讲](./vue-reactivity-system.md)
- 下一篇：[生命周期钩子](./vue-lifecycle-hooks.md)

**参考**：
- [Vue 计算属性](https://cn.vuejs.org/guide/essentials/computed.html)
- [Vue 侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
