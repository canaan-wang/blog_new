# 组合式 API 中的路由

> 在 setup 中使用 Vue Router 的组合式 API，实现更灵活的路由操作。

---

## 一、useRouter 和 useRoute

### 1.1 基本使用

```vue
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()  // 路由实例
const route = useRoute()    // 当前路由信息

// 当前路由参数
console.log(route.params.id)
console.log(route.query.search)

// 导航
function goToUser(id) {
  router.push(`/user/${id}`)
}

function goBack() {
  router.back()
}
</script>
```

### 1.2 响应式路由信息

```vue
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 响应式参数
const userId = computed(() => route.params.id)

// 监听查询参数变化
watch(() => route.query.page, (newPage) => {
  fetchData(newPage)
})
</script>
```

---

## 二、程序化导航

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 字符串
router.push('/user')

// 对象
router.push({ path: '/user' })

// 命名路由
router.push({ name: 'User', params: { id: 123 } })

// 带查询
router.push({ path: '/search', query: { q: 'vue' } })

// 替换当前历史
router.replace('/user')

// 前进后退
router.go(-1)
router.back()
router.forward()
```

---

## 三、路由监听

### 3.1 监听路由变化

```vue
<script setup>
import { watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()

// 方式1：watch
watch(
  () => route.params.id,
  (newId, oldId) => {
    fetchUser(newId)
  }
)

// 方式2：导航守卫（组件复用时）
onBeforeRouteUpdate((to, from) => {
  // /user/1 -> /user/2 时触发
  fetchUser(to.params.id)
})
</script>
```

---

## 四、动态路由匹配

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// /user/:id
const userId = route.params.id

// /user/:id/post/:postId
const postId = route.params.postId

// ?search=vue&page=2
const search = route.query.search
const page = route.query.page
</script>
```

---

## 五、总结速查

```javascript
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 信息
route.params.id
route.query.search
route.path
route.name

// 导航
router.push('/path')
router.replace('/path')
router.back()

// 监听
watch(() => route.params.id, callback)
onBeforeRouteUpdate((to, from) => {})
```

---

**相关文章：**
- 上一篇：[导航守卫与路由元信息](./vue-navigation-guards.md)
- 下一篇：[Vue 3 渲染机制](./vue-rendering-mechanism.md)

**参考：**
- [Vue Router 组合式 API](https://router.vuejs.org/guide/advanced/composition-api.html)
