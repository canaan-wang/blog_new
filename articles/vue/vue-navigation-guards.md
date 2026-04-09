# 导航守卫与路由元信息

> 导航守卫让你可以在路由跳转前后执行逻辑，常用于权限验证、页面标题设置等场景。

---

## 一、全局守卫

### 1.1 beforeEach

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  // to: 即将进入的路由
  // from: 当前要离开的路由
  // next: 控制导航行为
  
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

### 1.2 afterEach

```javascript
router.afterEach((to, from) => {
  // 没有 next，不能阻止导航
  // 常用于页面标题、埋点
  document.title = to.meta.title || 'Default Title'
})
```

### 1.3 resolve 和 error

```javascript
// 解析守卫
router.beforeResolve((to, from, next) => {
  // 在导航确认前、组件内守卫之后调用
  next()
})

// 错误处理
router.onError((err) => {
  console.error('Routing error:', err)
})
```

---

## 二、路由独享守卫

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (!isAdmin()) {
        next('/403')
      } else {
        next()
      }
    }
  }
]
```

---

## 三、组件内守卫

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开守卫
onBeforeRouteLeave((to, from, next) => {
  const answer = window.confirm('确定要离开吗？未保存的更改将丢失。')
  if (answer) {
    next()
  } else {
    next(false) // 取消导航
  }
})

// 复用组件时更新
onBeforeRouteUpdate((to, from) => {
  // 当 /user/1 跳转到 /user/2 时触发
  userId.value = to.params.id
  fetchUser(to.params.id)
})
</script>
```

---

## 四、路由元信息

### 4.1 定义 meta

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台',
      keepAlive: true
    }
  }
]
```

### 4.2 访问 meta

```javascript
// 守卫中
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // 需要登录
  }
})

// 组件中
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.meta.title)
```

---

## 五、过渡动画

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 六、总结速查

```javascript
// 全局守卫
router.beforeEach((to, from, next) => { next() })
router.afterEach((to, from) => {})

// 路由独享
beforeEnter: (to, from, next) => { next() }

// 组件内
onBeforeRouteLeave((to, from, next) => { next() })
onBeforeRouteUpdate((to, from) => {})

// Meta
meta: { requiresAuth: true, title: 'Page' }
```

---

**相关文章：**
- 上一篇：[Vue Router 4 基础](./vue-router-basics.md)
- 下一篇：[组合式 API 中的路由](./vue-router-composition-api.md)

**参考：**
- [Vue Router 导航守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)
