# Pinia 完全指南

> Pinia 是 Vue 3 官方推荐的状态管理库，相比 Vuex 更轻量、类型友好、API 更简洁。本文从基础到进阶全面掌握 Pinia。

---

## 一、Pinia vs Vuex

| 特性 | Vuex 4 | Pinia |
|------|--------|-------|
| **学习曲线** | 陡 | 平缓 |
| **TypeScript** | 需要复杂的类型封装 | 原生支持 |
| **代码量** | 多（Mutations + Actions） | 少（无 Mutations） |
| **模块化** | 需要命名空间 | 自动模块化 |
| **体积** | 较大 | 更轻量（~1KB） |
| **DevTools** | 支持 | 更好支持 |

---

## 二、安装与配置

### 2.1 安装

```bash
npm install pinia
```

### 2.2 创建 Pinia 实例

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
```

---

## 三、定义 Store

### 3.1 Option Store（类似 Vuex）

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    
    // 使用 this 访问其他 getter
    doublePlusOne() {
      return this.doubleCount + 1
    }
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    async fetchUser() {
      const res = await fetch('/api/user')
      this.name = (await res.json()).name
    }
  }
})
```

### 3.2 Setup Store（推荐）

```javascript
// stores/counter.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Eduardo')
  
  // Getters
  const doubleCount = computed(() => count.value * 2)
  
  // Actions
  function increment() {
    count.value++
  }
  
  async function fetchUser() {
    const res = await fetch('/api/user')
    name.value = (await res.json()).name
  }
  
  return { count, name, doubleCount, increment, fetchUser }
})
```

---

## 四、使用 Store

### 4.1 基础使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

// 获取 store 实例
const counter = useCounterStore()

// 解构时使用 storeToRefs 保持响应性
const { count, doubleCount } = storeToRefs(counter)

// 方法可以直接解构
const { increment } = counter
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="counter.increment()">+1 (alternative)</button>
  </div>
</template>
```

### 4.2 修改 State

```javascript
// 直接修改（允许）
counter.count++

// 批量修改
counter.$patch({
  count: counter.count + 1,
  name: 'Abalam'
})

// 函数式修改（推荐批量）
counter.$patch((state) => {
  state.count++
  state.name = 'Abalam'
})

// 重置 state
counter.$reset() // 仅 Option Store

// Setup Store 需要手动实现 reset
function reset() {
  count.value = 0
  name.value = 'Eduardo'
}
```

---

## 五、Getters

```javascript
export const useStore = defineStore('main', {
  state: () => ({
    users: [{ id: 1, name: 'Alice' }],
    filter: ''
  }),
  
  getters: {
    // 接收 state
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId)
    },
    
    // 使用其他 getter
    filteredUsers() {
      return this.users.filter(user => 
        user.name.includes(this.filter)
      )
    }
  }
})

// 使用
const store = useStore()
store.getUserById(1) // { id: 1, name: 'Alice' }
```

---

## 六、Actions

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    userData: null,
    loading: false,
    error: null
  }),
  
  actions: {
    // 同步 action
    logout() {
      this.userData = null
      localStorage.removeItem('token')
    },
    
    // 异步 action
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        })
        
        if (!res.ok) throw new Error('Login failed')
        
        this.userData = await res.json()
        localStorage.setItem('token', this.userData.token)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  }
})
```

---

## 七、总结速查

```javascript
// 定义 Store
const useStore = defineStore('id', () => {
  // State
  const state = ref(value)
  
  // Getters
  const getter = computed(() => state.value)
  
  // Actions
  function action() { state.value++ }
  
  return { state, getter, action }
})

// 使用
const store = useStore()
const { state, getter } = storeToRefs(store)
const { action } = store

// 修改
store.state = newValue
store.$patch({ state: newValue })
store.action()
```

---

**相关文章：**
- 上一篇：[VueUse 库深度使用](./vue-vueuse.md)
- 下一篇：[Pinia 进阶技巧](./vue-pinia-advanced.md)

**参考：**
- [Pinia 官方文档](https://pinia.vuejs.org/)
