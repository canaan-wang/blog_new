# Vue 2 迁移 Vue 3 完整指南

> 从 Options API 到 Composition API，平滑升级迁移路径

## 迁移前评估

### 迁移收益

| 方面 | Vue 2 | Vue 3 |
|------|-------|-------|
| 性能 | 良好 | 更好（Tree-shaking、PatchFlag）|
| TypeScript | 支持有限 | 原生支持 |
| 代码复用 | Mixins/HOC | Composition API |
| 包体积 | ~23KB | ~10KB（运行时）|
| 维护 | 2024年底停止 | 持续更新 |

### 兼容性检查

```bash
# 使用官方迁移工具检查
npm install -g @vue/cli
vue upgrade --next

# 或使用迁移构建版测试
npm install vue@^3.1.0
npm install @vue/compat
```

---

## 迁移策略

### 方案一：兼容模式（推荐渐进式）

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2  // 兼容模式
          }
        }
      }
    })
  ],
  resolve: {
    alias: {
      vue: '@vue/compat'
    }
  }
})
```

```js
// main.js
import { createApp, configureCompat } from 'vue'

// 配置兼容行为
configureCompat({
  GLOBAL_MOUNT: false,      // 使用 createApp
  INSTANCE_ATTR_CLASS_STYLE: false,
  COMPONENT_V_MODEL: false,
  WATCH_ARRAY: false
})

const app = createApp(App)
app.mount('#app')
```

### 方案二：全新重构（适合小项目）

- 直接创建 Vue 3 项目
- 逐个组件重写
- 放弃兼容层，获得最佳性能

---

## 全局 API 变更

### 实例创建

```js
// ❌ Vue 2
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

```js
// ✅ Vue 3
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(router)
app.use(store)
app.mount('#app')
```

### 全局配置

```js
// ❌ Vue 2
Vue.config.ignoredElements = ['my-custom-element']
Vue.prototype.$api = api
Vue.filter('capitalize', capitalize)
Vue.directive('focus', focusDirective)
```

```js
// ✅ Vue 3
const app = createApp(App)

app.config.compilerOptions.isCustomElement = tag => 
  tag.startsWith('my-')

app.config.globalProperties.$api = api

app.directive('focus', focusDirective)
// 过滤器已移除，改用计算属性或方法
```

### Provide/Inject

```js
// ❌ Vue 2
Vue.prototype.$http = () => {}

// ✅ Vue 3
import { createApp, provide, inject } from 'vue'

const app = createApp(App)
app.provide('http', httpClient)

// 组件中使用
const http = inject('http')
```

---

## Options API → Composition API

### 基础转换

```vue
<!-- ❌ Vue 2 Options API -->
<script>
export default {
  data() {
    return {
      count: 0,
      user: null
    }
  },
  
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  
  watch: {
    count(newVal, oldVal) {
      console.log('count changed:', newVal)
    }
  },
  
  methods: {
    increment() {
      this.count++
    },
    async fetchUser() {
      this.user = await api.getUser()
    }
  },
  
  mounted() {
    this.fetchUser()
  }
}
</script>
```

```vue
<!-- ✅ Vue 3 Composition API -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 响应式数据
const count = ref(0)
const user = ref(null)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log('count changed:', newVal)
})

// 方法
const increment = () => {
  count.value++
}

const fetchUser = async () => {
  user.value = await api.getUser()
}

// 生命周期
onMounted(() => {
  fetchUser()
})
</script>
```

### Props / Emits

```vue
<!-- ❌ Vue 2 -->
<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
      default: 'Default Title'
    },
    count: Number
  },
  
  methods: {
    handleClick() {
      this.$emit('update', this.count + 1)
      this.$emit('submit', { id: 1 })
    }
  }
}
</script>
```

```vue
<!-- ✅ Vue 3 -->
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
    default: 'Default Title'
  },
  count: Number
})

const emit = defineEmits(['update', 'submit'])

const handleClick = () => {
  emit('update', props.count + 1)
  emit('submit', { id: 1 })
}
</script>
```

### 生命周期映射

| Vue 2 | Vue 3 (Options) | Vue 3 (Composition) |
|-------|-----------------|---------------------|
| beforeCreate | beforeCreate | setup() |
| created | created | setup() |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestroy | **beforeUnmount** | onBeforeUnmount |
| destroyed | **unmounted** | onUnmounted |
| errorCaptured | errorCaptured | onErrorCaptured |
| activated | activated | onActivated |
| deactivated | deactivated | onDeactivated |

---

## 响应式系统变更

### Vue 2 → Vue 3 API

```js
// ❌ Vue 2
import Vue from 'vue'

const state = Vue.observable({ count: 0 })

// 添加属性
Vue.set(state, 'name', 'Vue')
Vue.delete(state, 'count')

// 数组
state.list[0] = 'a'  // 不能触发更新
state.list.push('b')  // 可以触发更新
```

```js
// ✅ Vue 3
import { reactive, ref, set, del } from 'vue'

const state = reactive({ count: 0 })

// 直接添加/删除属性
state.name = 'Vue'  // ✅ 自动响应
delete state.count   // ✅ 自动响应

// 数组索引赋值
const list = reactive([1, 2, 3])
list[0] = 'a'  // ✅ 自动响应

// ref 替代简单值
const count = ref(0)
count.value++
```

### 响应式转换

```js
// Vue 3 响应式 API
import { ref, reactive, readonly, shallowRef } from 'vue'

// ref: 任意类型
const count = ref(0)
const user = ref({ name: 'John' })

// reactive: 仅对象/数组
const state = reactive({ count: 0 })

// readonly: 只读
const readonlyState = readonly(state)

// shallowRef: 浅层响应（性能优化）
const hugeList = shallowRef([...大量数据])
```

---

## 模板变更

### v-model

```vue
<!-- ❌ Vue 2 -->
<input v-model="value">
<!-- 等价于 -->
<input :value="value" @input="value = $event.target.value">

<!-- 自定义组件 -->
<Child v-model="value">
<!-- 等价于 -->
<Child :value="value" @input="value = $event">

<!-- 多 v-model -->
<Child v-model:title="title" v-model:content="content">
```

```vue
<!-- ✅ Vue 3 -->
<input v-model="value">
<!-- 等价于 -->
<input :modelValue="value" @update:modelValue="value = $event">

<!-- 自定义组件 -->
<Child v-model="value">
<!-- 等价于 -->
<Child :modelValue="value" @update:modelValue="value = $event">

<!-- 多 v-model（相同） -->
<Child v-model:title="title" v-model:content="content">
```

### 移除的语法

```vue
<!-- ❌ 已移除 -->
<!-- 过滤器 -->
{{ msg | capitalize }}

<!-- 模板中的 $listeners -->
<Child v-on="$listeners" />

<!-- 原生事件 .native -->
<Child @click.native="handle" />

<!-- 函数式组件 template -->
<template functional>
```

```vue
<!-- ✅ 替代方案 -->
<!-- 过滤器 -> 计算属性或方法 -->
{{ capitalize(msg) }}

<!-- $listeners -> $attrs（包含事件） -->
<Child v-bind="$attrs" />

<!-- .native -> emits 声明 -->
<!-- 子组件声明 emits: ['click'] -->
<Child @click="handle" />

<!-- 函数式组件 -> 函数写法 -->
<script setup>
const FunctionalComp = (props, { slots }) => h('div', slots.default?.())
</script>
```

---

## Vuex → Pinia

### Store 定义

```js
// ❌ Vue 2 + Vuex
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    count: 0
  },
  
  getters: {
    isLoggedIn: state => !!state.user,
    doubleCount: state => state.count * 2
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    INCREMENT(state) {
      state.count++
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      const user = await api.login(credentials)
      commit('SET_USER', user)
    }
  }
})
```

```js
// ✅ Vue 3 + Pinia
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    count: 0
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user,
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    setUser(user) {
      this.user = user  // 直接修改，无需 mutation
    },
    
    async login(credentials) {
      const user = await api.login(credentials)
      this.user = user  // 直接赋值
    }
  }
})

// 或使用 Setup Store 写法
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

### 组件中使用

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const store = useUserStore()

// 保持响应式
const { user, isLoggedIn } = storeToRefs(store)

// 方法直接解构
const { login, logout } = store
</script>

<template>
  <div v-if="isLoggedIn">{{ user.name }}</div>
  <button @click="login(credentials)">登录</button>
</template>
```

---

## Vue Router 变更

```js
// ❌ Vue 2
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [...]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    next('/login')
  } else {
    next()
  }
})
```

```js
// ✅ Vue 3
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
})

// 导航守卫
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    return '/login'  // 直接返回路径或对象
  }
  // 无需调用 next()
})
```

---

## 第三方库升级

### 常用库 Vue 3 支持

| 库 | Vue 2 版本 | Vue 3 版本 |
|----|-----------|-----------|
| Element UI | element-ui | element-plus |
| Vuetify | v2 | v3 |
| Ant Design | ant-design-vue@1 | ant-design-vue@3 |
| Vue Router | vue-router@3 | vue-router@4 |
| Vuex | vuex@3 | pinia |
| VeeValidate | v3 | v4 |

### 检查兼容性

```bash
# 使用 npm 检查
npm ls vue

# 查看 peer dependencies
npm info element-plus peerDependencies
```

---

## 迁移检查清单

### 代码层面

- [ ] 全局 API 迁移（Vue → createApp）
- [ ] 组件 Options API → Composition API（可选）
- [ ] Vuex → Pinia（推荐）
- [ ] Vue Router 3 → 4
- [ ] 移除过滤器（→ 计算属性/方法）
- [ ] 检查 .native 修饰符
- [ ] 更新 v-model 用法
- [ ] 替换 $listeners

### 构建工具

- [ ] Vue CLI → Vite（推荐）
- [ ] webpack → Rollup/esbuild
- [ ] 更新 babel 配置
- [ ] 检查 postcss 配置

### 测试

- [ ] 单元测试（Vue Test Utils → v2）
- [ ] E2E 测试（Cypress/Playwright）
- [ ] 视觉回归测试

---

## 相关文章

- 上一篇：[Vue 3 与 TypeScript](./vue-typescript.md)
- 下一篇：Vue vs React 对比
