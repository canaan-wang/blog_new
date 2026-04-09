# Vue 3 自定义指令完全指南

> 扩展模板能力，封装 DOM 操作逻辑

## 什么是自定义指令

自定义指令让你可以直接操作 DOM，适用于以下场景：
- 表单自动聚焦
- 权限控制
- 拖拽排序
- 图片懒加载
- 点击外部关闭

Vue 3 指令的生命周期钩子与组件保持一致。

---

## 指令生命周期钩子

| 钩子 | 调用时机 |
|------|----------|
| `created` | 指令绑定到元素时（DOM 还未创建） |
| `beforeMount` | 元素挂载前 |
| `mounted` | 元素挂载后 |
| `beforeUpdate` | 更新前 |
| `updated` | 更新后 |
| `beforeUnmount` | 卸载前 |
| `unmounted` | 卸载后 |

### 钩子参数

```js
(el, binding, vnode, prevVnode) => {
  // el: 绑定的 DOM 元素
  // binding: 指令相关信息对象
  // vnode: 虚拟节点
  // prevVnode: 上一个虚拟节点（更新时）
}
```

**binding 对象包含：**

| 属性 | 说明 |
|------|------|
| `value` | 指令的值（v-focus="true"）|
| `oldValue` | 更新前的值 |
| `arg` | 参数（v-focus:input）|
| `modifiers` | 修饰符对象（v-focus.lazy）|
| `instance` | 组件实例 |
| `dir` | 指令定义对象 |

---

## 实战案例

### 1. 自动聚焦 v-focus

最基础也最常用的指令。

```js
// directives/focus.js
export const vFocus = {
  mounted(el) {
    el.focus()
  }
}
```

```vue
<!-- 使用方式 -->
<template>
  <input v-focus placeholder="自动聚焦" />
</template>

<script setup>
import { vFocus } from './directives/focus.js'
</script>
```

**带延迟的聚焦（等待动画结束）：**

```js
export const vFocus = {
  mounted(el, binding) {
    const delay = binding.value || 0
    setTimeout(() => el.focus(), delay)
  }
}

// 使用: v-focus="300" 延迟300ms
```

---

### 2. 权限控制 v-permission

根据用户权限控制元素显示/隐藏。

```js
// directives/permission.js
import { useUserStore } from '@/stores/user'

export const vPermission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions
    
    // 支持单个权限或权限数组
    const requiredPermissions = Array.isArray(value) ? value : [value]
    const hasPermission = requiredPermissions.some(p => permissions.includes(p))
    
    if (!hasPermission) {
      el.remove()  // 无权限则移除元素
    }
  }
}
```

```vue
<template>
  <!-- 按钮权限控制 -->
  <button v-permission="'user:create'">新增用户</button>
  <button v-permission="['user:edit', 'admin']">编辑</button>
  
  <!-- 完整权限区域 -->
  <div v-permission="'system:manage'">
    <h3>系统管理</h3>
    <!-- 只有系统管理员可见的内容 -->
  </div>
</template>
```

**更精细的控制（显示/禁用而非移除）：**

```js
export const vPermission = {
  mounted(el, binding) {
    const { value, modifiers } = binding
    const userStore = useUserStore()
    const hasPermission = userStore.hasPermission(value)
    
    if (!hasPermission) {
      if (modifiers.disable) {
        // 禁用模式：置灰并阻止点击
        el.disabled = true
        el.classList.add('permission-disabled')
      } else if (modifiers.hide) {
        // 隐藏模式：visibility: hidden 保留布局
        el.style.visibility = 'hidden'
      } else {
        // 默认：直接移除
        el.remove()
      }
    }
  }
}

// 使用
<button v-permission.disable="'user:delete'">删除</button>
```

---

### 3. 点击外部关闭 v-click-outside

实现下拉菜单、弹窗的点击外部关闭功能。

```js
// directives/clickOutside.js
export const vClickOutside = {
  mounted(el, binding) {
    // 存储处理函数以便卸载时移除
    el._clickOutside = (event) => {
      // 点击元素本身或其子元素时不触发
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    
    // 延迟绑定，避免当前点击事件立即触发
    setTimeout(() => {
      document.addEventListener('click', el._clickOutside)
    }, 0)
  },
  
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
    delete el._clickOutside
  }
}
```

```vue
<template>
  <div class="dropdown">
    <button @click="show = !show">菜单</button>
    <div v-show="show" v-click-outside="closeMenu" class="dropdown-menu">
      <!-- 菜单内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { vClickOutside } from './directives/clickOutside.js'

const show = ref(false)
const closeMenu = () => { show.value = false }
</script>
```

---

### 4. 图片懒加载 v-lazy

优化页面加载性能。

```js
// directives/lazy.js
const imageCache = new Map()

export const vLazy = {
  mounted(el, binding) {
    const src = binding.value
    
    // 使用 Intersection Observer 检测可见性
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(el, src)
          observer.unobserve(el)
        }
      })
    }, {
      rootMargin: '50px'  // 提前50px开始加载
    })
    
    el._lazyObserver = observer
    el.src = binding.arg || '/placeholder.png'  // 占位图
    observer.observe(el)
  },
  
  unmounted(el) {
    el._lazyObserver?.disconnect()
  }
}

function loadImage(el, src) {
  // 缓存检查
  if (imageCache.has(src)) {
    el.src = src
    return
  }
  
  const img = new Image()
  img.onload = () => {
    el.src = src
    imageCache.set(src, true)
    el.classList.add('loaded')
  }
  img.onerror = () => {
    el.classList.add('error')
  }
  img.src = src
}
```

```vue
<template>
  <img v-lazy="realSrc" src="/loading.gif" alt="懒加载图片" />
</template>
```

---

### 5. 拖拽排序 v-sortable

实现列表拖拽排序功能。

```js
// directives/sortable.js
export const vSortable = {
  mounted(el, binding) {
    const { onUpdate, handle = null } = binding.value || {}
    
    // 引入 Sortable.js
    import('sortablejs').then(({ default: Sortable }) => {
      el._sortable = Sortable.create(el, {
        animation: 150,
        handle: handle,  // 拖拽把手选择器
        onEnd(evt) {
          const { oldIndex, newIndex } = evt
          if (oldIndex !== newIndex && onUpdate) {
            onUpdate(oldIndex, newIndex)
          }
        }
      })
    })
  },
  
  unmounted(el) {
    el._sortable?.destroy()
  }
}
```

```vue
<template>
  <ul v-sortable="{ onUpdate: handleSort }">
    <li v-for="item in list" :key="item.id">{{ item.name }}</li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'

const list = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  // ...
])

const handleSort = (oldIndex, newIndex) => {
  const item = list.value.splice(oldIndex, 1)[0]
  list.value.splice(newIndex, 0, item)
}
</script>
```

---

## 全局注册指令

### 单文件注册

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { vFocus } from './directives/focus.js'
import { vPermission } from './directives/permission.js'

const app = createApp(App)

app.directive('focus', vFocus)
app.directive('permission', vPermission)

app.mount('#app')
```

### 批量注册

```js
// directives/index.js
import { vFocus } from './focus.js'
import { vPermission } from './permission.js'
import { vClickOutside } from './clickOutside.js'
import { vLazy } from './lazy.js'

export const directives = {
  focus: vFocus,
  permission: vPermission,
  clickOutside: vClickOutside,
  lazy: vLazy
}

// main.js
import { directives } from './directives'

Object.entries(directives).forEach(([name, directive]) => {
  app.directive(name, directive)
})
```

### 自动导入（Vite + unplugin-auto-import）

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      dirs: ['./src/directives'],
      vueTemplate: true
    })
  ]
})
```

---

## 指令最佳实践

### ✅ Do

- **单一职责**：一个指令只做一件事
- **清理副作用**：在 `unmounted` 中移除事件监听、定时器等
- **参数校验**：使用 `console.warn` 提示错误用法
- **默认配置**：通过 `binding.arg` 和 `modifiers` 提供灵活性

```js
export const vTooltip = {
  mounted(el, binding) {
    // 参数校验
    if (!binding.value) {
      console.warn('v-tooltip requires a value')
      return
    }
    // ...
  }
}
```

### ❌ Don't

- 用指令替代组件：复杂逻辑用组件，简单 DOM 操作用指令
- 在指令中直接修改组件状态：通过回调函数通知组件
- 忽略内存泄漏：忘记清理事件监听和引用

---

## 速查表

| 需求 | 实现思路 |
|------|----------|
| 自动聚焦 | `mounted` 中调用 `el.focus()` |
| 权限控制 | 检查权限后 `el.remove()` 或 `el.disabled = true` |
| 点击外部 | `document.addEventListener('click', handler)` |
| 图片懒加载 | `IntersectionObserver` + 动态设置 `src` |
| 拖拽排序 | 集成 `Sortable.js` 或原生 Drag API |
| 输入防抖 | `mounted` 中绑定防抖处理函数 |
| 水印 | `Canvas` 生成图片，设为 `background-image` |

---

## 相关文章

- 上一篇：[Vue 3 渲染机制](./vue-rendering-mechanism.md)
- 下一篇：渲染函数与 JSX
