# Pinia 进阶技巧

> 掌握 Pinia 的高级特性，包括插件系统、持久化存储、SSR 支持和更复杂的 Store 组合模式。

---

## 一、插件系统

### 1.1 创建插件

```javascript
// pinia-plugin.js
export function myPiniaPlugin({ store }) {
  // 在每个 store 创建时执行
  store.$onAction(({ name, store, args, after, onError }) => {
    console.log(`Action "${name}" in "${store.$id}"`)
    
    // 在 action 成功后执行
    after((result) => {
      console.log('Succeeded:', result)
    })
    
    // 在 action 失败时执行
    onError((error) => {
      console.error('Failed:', error)
    })
  })
  
  // 添加全局属性
  store.hello = 'from plugin'
}
```

### 1.2 注册插件

```javascript
// main.js
import { createPinia } from 'pinia'
import { myPiniaPlugin } from './pinia-plugin'

const pinia = createPinia()
pinia.use(myPiniaPlugin)
```

### 1.3 持久化插件示例

```javascript
// pinia-persist-plugin.js
export function persistPlugin({ store }) {
  // 从 localStorage 恢复
  const stored = localStorage.getItem(store.$id)
  if (stored) {
    store.$patch(JSON.parse(stored))
  }
  
  // 订阅变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
}
```

---

## 二、Store 组合

### 2.1 在 Store 中使用其他 Store

```javascript
// stores/user.js
export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  return { isLoggedIn }
})

// stores/cart.js
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const userStore = useUserStore()
  
  const canCheckout = computed(() => {
    return items.value.length > 0 && userStore.isLoggedIn
  })
  
  async function checkout() {
    if (!userStore.isLoggedIn) {
      throw new Error('Please login first')
    }
    // ...
  }
  
  return { items, canCheckout, checkout }
})
```

---

## 三、SSR 支持

### 3.1 Nuxt 3 中使用

```vue
<script setup>
const store = useCounterStore()

// 服务端获取数据
if (process.server) {
  await store.fetchData()
}
</script>
```

### 3.2 状态序列化

```javascript
// 服务端序列化状态
const pinia = createPinia()
const state = JSON.stringify(pinia.state.value)

// 客户端恢复状态
pinia.state.value = JSON.parse(state)
```

---

## 四、最佳实践

### 4.1 Store 组织

```
stores/
├── index.js          # 导出所有 store
├── user.js           # 用户相关
├── cart.js           # 购物车
├── product.js        # 商品
└── settings.js       # 应用设置
```

```javascript
// stores/index.js
export { useUserStore } from './user'
export { useCartStore } from './cart'
export { useProductStore } from './product'
```

### 4.2 避免循环依赖

```javascript
// ❌ 错误：直接导入导致循环依赖
import { useBStore } from './b'

// ✅ 正确：在 action 中动态导入
async function someAction() {
  const { useBStore } = await import('./b')
  const bStore = useBStore()
}
```

---

## 五、总结速查

```javascript
// 插件
function myPlugin({ store }) {
  store.$onAction(({ name, after }) => {
    console.log(name)
    after(() => console.log('done'))
  })
}
pinia.use(myPlugin)

// Store 组合
const otherStore = useOtherStore()

// SSR
const state = JSON.stringify(pinia.state.value)
pinia.state.value = JSON.parse(state)
```

---

**相关文章：**
- 上一篇：[Pinia 完全指南](./vue-pinia-guide.md)
- 下一篇：[从 Vuex 迁移到 Pinia](./vue-vuex-to-pinia.md)

**参考：**
- [Pinia 插件](https://pinia.vuejs.org/core-concepts/plugins.html)
