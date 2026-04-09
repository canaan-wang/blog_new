# 从 Vuex 迁移到 Pinia

> Vuex 正在进入维护模式，Pinia 已成为 Vue 官方推荐的状态管理方案。本文提供详细的迁移指南。

---

## 一、核心差异对比

| Vuex | Pinia | 说明 |
|------|-------|------|
| `state` | `state` | 相同 |
| `getters` | `getters` | 相同 |
| `mutations` | ❌ 无 | Pinia 直接修改 state |
| `actions` | `actions` | 相同，但可直接修改 state |
| `modules` | ❌ 不需要 | 每个 store 天然独立 |
| `namespaced` | ❌ 不需要 | store id 天然隔离 |

---

## 二、逐步迁移策略

### 2.1 新建 Pinia Store

```javascript
// stores/user.js (Pinia)
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    isLoggedIn: false
  }),
  getters: {
    fullName: (state) => `Mr./Ms. ${state.name}`
  },
  actions: {
    login(userData) {
      // 直接修改，无需 mutation
      this.name = userData.name
      this.isLoggedIn = true
    }
  }
})
```

### 2.2 组件中混用

```vue
<script setup>
// 可以同时使用 Vuex 和 Pinia
import { useStore } from 'vuex'
import { useUserStore } from '@/stores/user'

const vuexStore = useStore()
const piniaStore = useUserStore()

// 读取
const vuexCount = computed(() => vuexStore.state.count)
const piniaName = computed(() => piniaStore.name)
</script>
```

---

## 三、常见模式转换

### 3.1 State

```javascript
// Vuex
const store = new Vuex.Store({
  state: {
    count: 0,
    user: null
  }
})

// Pinia
const useStore = defineStore('main', {
  state: () => ({
    count: 0,
    user: null
  })
})

// 使用
const store = useStore()
store.count++  // 直接修改！
```

### 3.2 Getters

```javascript
// Vuex
getters: {
  doubleCount: state => state.count * 2,
  fullName: (state, getters) => `${state.firstName} ${state.lastName}`
}

// Pinia
getters: {
  doubleCount: (state) => state.count * 2,
  fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
```

### 3.3 Actions

```javascript
// Vuex
actions: {
  async fetchUser({ commit }, id) {
    const user = await api.getUser(id)
    commit('SET_USER', user)
  }
}

// Pinia
actions: {
  async fetchUser(id) {
    const user = await api.getUser(id)
    this.user = user  // 直接赋值
  }
}
```

---

## 四、模块化迁移

### 4.1 Vuex 模块化

```javascript
// store/modules/user.js (Vuex)
export default {
  namespaced: true,
  state: () => ({ name: '' }),
  mutations: {
    SET_NAME(state, name) {
      state.name = name
    }
  }
}

// 使用
store.commit('user/SET_NAME', 'Alice')
```

### 4.2 Pinia 模块化

```javascript
// stores/user.js (Pinia)
export const useUserStore = defineStore('user', {
  state: () => ({ name: '' })
})

// 使用
const userStore = useUserStore()
userStore.name = 'Alice'
```

---

## 五、总结速查

```javascript
// Vuex -> Pinia 转换

// State
state: { count: 0 }
state: () => ({ count: 0 })

// Mutation (删除)
mutations: {
  SET_COUNT(state, val) { state.count = val }
}
// 直接修改
store.count = val

// Action
actions: {
  async fetch() {
    const data = await api.get()
    this.data = data  // 直接赋值
  }
}

// Module
// Vuex: 需要 namespaced
// Pinia: 每个文件就是一个模块
```

---

**相关文章：**
- 上一篇：[Pinia 进阶技巧](./vue-pinia-advanced.md)
- 下一篇：[Vue Router 4 基础](./vue-router-basics.md)

**参考：**
- [Pinia 迁移指南](https://pinia.vuejs.org/cookbook/migration-vuex.html)
