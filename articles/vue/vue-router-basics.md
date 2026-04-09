# Vue Router 4 基础

> Vue Router 4 是 Vue 3 的官方路由管理器，提供了声明式导航、动态路由匹配、嵌套路由等强大功能。

---

## 一、安装与配置

### 1.1 安装

```bash
npm install vue-router@4
```

### 1.2 创建路由实例

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 1.3 注册路由

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

---

## 二、基础路由配置

### 2.1 路由匹配

```javascript
const routes = [
  // 静态路由
  { path: '/', component: Home },
  
  // 动态路由
  { path: '/user/:id', component: User },
  
  // 可选参数
  { path: '/user/:id?', component: User },
  
  // 多段动态路由
  { path: '/user/:userId/post/:postId', component: Post },
  
  // 通配符（404）
  { path: '/:pathMatch(.*)*', component: NotFound }
]
```

### 2.2 嵌套路由

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      { path: '', component: UserHome },
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts }
    ]
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div>
    <h2>User {{ $route.params.id }}</h2>
    <router-view></router-view>
  </div>
</template>
```

---

## 三、导航方式

### 3.1 声明式导航

```vue
<template>
  <!-- 基础链接 -->
  <router-link to="/">Home</router-link>
  
  <!-- v-bind -->
  <router-link :to="'/user/' + userId">User</router-link>
  
  <!-- 对象形式 -->
  <router-link :to="{ path: '/user', query: { id: 123 }">
    User with query
  </router-link>
  
  <!-- 命名路由 -->
  <router-link :to="{ name: 'User', params: { id: 123 }">
    Named Route
  </router-link>
  
  <!-- 激活样式 -->
  <router-link to="/user" active-class="active">User</router-link>
</template>
```

### 3.2 编程式导航

```javascript
// 字符串路径
router.push('/user')

// 对象
router.push({ path: '/user' })

// 命名路由 + 参数
router.push({ name: 'User', params: { id: 123 } })

// 带查询参数
router.push({ path: '/user', query: { plan: 'premium' } })
// 结果: /user?plan=premium

// 替换当前历史记录
router.replace('/user')

// 前进/后退
router.go(1)   // 前进
router.go(-1)  // 后退
router.back()
router.forward()
```

---

## 四、路由组件

### 4.1 RouterView

```vue
<template>
  <!-- 基础用法 -->
  <router-view></router-view>
  
  <!-- 命名视图 -->
  <router-view name="sidebar"></router-view>
  <router-view></router-view>
</template>
```

```javascript
{
  path: '/',
  components: {
    default: Home,
    sidebar: Sidebar
  }
}
```

---

## 五、总结速查

```javascript
// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/user/:id', component: User },
    { 
      path: '/parent',
      component: Parent,
      children: [
        { path: 'child', component: Child }
      ]
    }
  ]
})

// 导航
router.push('/path')
router.push({ name: 'User', params: { id: 1 } })
router.replace('/path')
router.back()

// 模板
<router-link to="/">Home</router-link>
<router-link :to="{ name: 'User', params: { id: 1 }">User</router-link>
```

---

**相关文章：**
- 上一篇：[从 Vuex 迁移到 Pinia](./vue-vuex-to-pinia.md)
- 下一篇：[导航守卫与路由元信息](./vue-navigation-guards.md)

**参考：**
- [Vue Router 文档](https://router.vuejs.org/)
