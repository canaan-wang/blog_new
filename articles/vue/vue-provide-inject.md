# Provide / Inject

> Provide 和 Inject 实现跨层级组件通信，避免层层传递 Props。适合主题、用户信息等全局数据的传递。

---

## 一、基础用法

### 1.1 Provide 提供数据

```vue
<!-- Parent.vue -->
<script setup>
import { provide, ref } from 'vue'

// 提供静态值
provide('message', 'Hello from parent')

// 提供响应式数据
const user = ref({ name: 'Alice', age: 25 })
provide('user', user)

// 提供方法
function updateUser(data) {
  Object.assign(user.value, data)
}
provide('updateUser', updateUser)
</script>

<template>
  <div>
    <DeepChild />
  </div>
</template>
```

### 1.2 Inject 注入数据

```vue
<!-- DeepChild.vue (嵌套多层后) -->
<script setup>
import { inject } from 'vue'

// 注入（无默认值）
const message = inject('message')

// 注入（带默认值）
const user = inject('user', { name: 'Guest' })

// 注入（带工厂函数默认值）
const config = inject('config', () => ({ theme: 'light' }))

// 注入方法
const updateUser = inject('updateUser')
</script>

<template>
  <div>
    <p>{{ message }}</p>
    <p>User: {{ user?.name }}</p>
    <button @click="updateUser({ age: 26 })">
      Update Age
    </button>
  </div>
</template>
```

---

## 二、Symbol 作为 Key

### 2.1 避免命名冲突

```javascript
// keys.js
export const UserKey = Symbol('user')
export const ThemeKey = Symbol('theme')
export const ConfigKey = Symbol('config')
```

```vue
<!-- Provider -->
<script setup>
import { provide } from 'vue'
import { UserKey, ThemeKey } from './keys.js'

provide(UserKey, { name: 'Alice' })
provide(ThemeKey, { mode: 'dark' })
</script>
```

```vue
<!-- Consumer -->
<script setup>
import { inject } from 'vue'
import { UserKey, ThemeKey } from './keys.js'

const user = inject(UserKey)
const theme = inject(ThemeKey)
</script>
```

---

## 三、响应式注入

### 3.1 保持响应性

```vue
<!-- ThemeProvider.vue -->
<script setup>
import { provide, readonly, ref } from 'vue'
import { ThemeKey } from './keys.js'

const theme = ref({
  mode: 'light',
  primaryColor: '#1890ff'
})

// 提供只读版本，防止子组件直接修改
provide(ThemeKey, readonly(theme))

// 提供修改方法
function setTheme(newTheme) {
  Object.assign(theme.value, newTheme)
}
provide('setTheme', setTheme)
</script>
```

### 3.2 组合式函数封装

```javascript
// useTheme.js
import { inject, provide, readonly, ref } from 'vue'

const ThemeKey = Symbol('theme')

export function provideTheme() {
  const theme = ref({
    mode: 'light',
    primaryColor: '#1890ff'
  })
  
  function toggleMode() {
    theme.value.mode = theme.value.mode === 'light' ? 'dark' : 'light'
  }
  
  provide(ThemeKey, {
    theme: readonly(theme),
    toggleMode
  })
  
  return { theme, toggleMode }
}

export function useTheme() {
  const themeData = inject(ThemeKey)
  if (!themeData) {
    throw new Error('useTheme must be used after provideTheme')
  }
  return themeData
}
```

```vue
<!-- App.vue -->
<script setup>
import { provideTheme } from './useTheme.js'

provideTheme()
</script>
```

```vue
<!-- AnyChild.vue -->
<script setup>
import { useTheme } from './useTheme.js'

const { theme, toggleMode } = useTheme()
</script>

<template>
  <div :class="theme.mode">
    <button @click="toggleMode">
      {{ theme.mode }}
    </button>
  </div>
</template>
```

---

## 四、使用场景

### 4.1 依赖注入适用场景

| 场景 | 说明 |
|------|------|
| **主题配置** | 颜色、字体、布局模式 |
| **用户信息** | 登录状态、权限 |
| **国际化** | 语言、翻译函数 |
| **表单处理** | 表单状态、验证规则 |
| **路由配置** | 路由信息、导航方法 |

### 4.2 与 Props 对比

| 特性 | Props | Provide/Inject |
|------|-------|----------------|
| 方向 | 父子单向 | 祖先到后代 |
| 明确性 | 清晰可见 | 隐式依赖 |
| 适用距离 | 直接父子 | 跨多级组件 |
| 调试 | 容易 | 较难追踪 |

---

## 五、总结速查

```javascript
import { provide, inject, readonly } from 'vue'

// 提供
provide('key', value)
provide(SymbolKey, readonly(reactiveValue))

// 注入
const value = inject('key')
const value = inject('key', defaultValue)
const value = inject('key', () => factoryDefault)

// 最佳实践：Symbol key + 组合式函数
export const MyKey = Symbol('myKey')

export function provideMyFeature() {
  const state = ref({})
  provide(MyKey, readonly(state))
  return state
}

export function useMyFeature() {
  return inject(MyKey)
}
```

---

**相关文章**：
- 上一篇：[插槽 Slots 完全指南](./vue-slots.md)
- 下一篇：[组件实例与模板引用](./vue-component-refs.md)

**参考**：
- [Vue Provide/Inject](https://cn.vuejs.org/guide/components/provide-inject.html)
