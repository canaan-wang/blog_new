# Composition API 详解

> Composition API 是 Vue 3 最重要的新特性，它提供了一组 API 来组织组件逻辑，解决了 Options API 在大型组件中代码分散的问题。

---

## 一、为什么需要 Composition API

### 1.1 Options API 的痛点

```vue
<script>
export default {
  data() {
    return {
      // 搜索功能的数据
      searchQuery: '',
      searchResults: [],
      // 用户功能的数据
      user: null,
      userPosts: [],
      // 设置的数据
      theme: 'light',
      fontSize: 14
    }
  },
  methods: {
    // 搜索方法分散在各处
    handleSearch() { /* ... */ },
    // 用户方法
    fetchUser() { /* ... */ },
    // 设置方法
    toggleTheme() { /* ... */ }
  },
  computed: {
    // 搜索计算属性
    filteredResults() { /* ... */ },
    // 用户计算属性
    userName() { /* ... */ }
  },
  // 生命周期钩子也是分散的
  mounted() {
    this.handleSearch()
    this.fetchUser()
  }
}
</script>
```

**问题**：相关逻辑分散在 data、methods、computed 中，大型组件难以维护。

### 1.2 Composition API 的解决方式

```vue
<script setup>
// 搜索逻辑聚合在一起
function useSearch() {
  const searchQuery = ref('')
  const searchResults = ref([])
  const filteredResults = computed(() => /* ... */)
  const handleSearch = () => { /* ... */ }
  
  onMounted(handleSearch)
  
  return { searchQuery, searchResults, filteredResults, handleSearch }
}

// 用户逻辑聚合在一起
function useUser() {
  const user = ref(null)
  const userPosts = ref([])
  const userName = computed(() => user.value?.name)
  const fetchUser = () => { /* ... */ }
  
  onMounted(fetchUser)
  
  return { user, userPosts, userName, fetchUser }
}

// 组件中使用
const { searchQuery, filteredResults } = useSearch()
const { user, userName } = useUser()
</script>
```

---

## 二、setup() 函数

### 2.1 基本用法

```vue
<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    // 定义响应式数据
    const count = ref(0)
    const double = computed(() => count.value * 2)
    
    // 定义方法
    function increment() {
      count.value++
    }
    
    // 返回给模板使用
    return {
      count,
      double,
      increment
    }
  }
}
</script>
```

### 2.2 执行时机

```
beforeCreate 钩子
      ↓
   setup()  ← 此时组件实例已创建，但模板未挂载
      ↓
  created 钩子
```

**setup 中无法访问**：`this`、`data`、`computed`、`methods`

### 2.3 接收参数

```vue
<script>
export default {
  props: {
    title: String
  },
  emits: ['update'],
  setup(props, context) {
    // props：响应式，解构会丢失响应性
    console.log(props.title)
    
    // context：包含 attrs、slots、emit、expose
    context.emit('update', value)
    context.attrs.class
    context.slots.default()
    
    // 或解构（emit 等不是响应式的，可以解构）
    const { emit, slots } = context
  }
}
</script>
```

---

## 三、script setup 语法糖

### 3.1 基本语法

```vue
<script setup>
import { ref } from 'vue'

// 直接定义的变量自动暴露给模板
const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

### 3.2 编译原理

`<script setup>` 会被编译成 `setup()` 函数：

```javascript
// 源码
<script setup>
const count = ref(0)
</script>

// 编译后
export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
```

### 3.3 响应式语法糖（实验性）

```vue
<script setup>
// 需要配置编译器宏
// vite.config.js: reactivityTransform: true

// 使用 $ref 语法糖
let count = $ref(0)
count++  // 无需 .value

// 使用 $computed
let double = $computed(() => count * 2)
</script>
```

---

## 四、与 Options API 对比

| 特性 | Options API | Composition API |
|------|-------------|-----------------|
| **代码组织** | 按选项类型 | 按逻辑功能 |
| **逻辑复用** | Mixins（有缺点） | Composables（推荐）|
| **TypeScript** | 支持一般 | 完全支持 |
| **Tree-shaking** | 有限 | 更好 |
| **学习曲线** | 平缓 | 稍陡 |
| **适用场景** | 小型组件、选项式代码库 | 大型组件、复杂逻辑 |

### 4.1 两种 API 混用

```vue
<script>
// Options API 部分
export default {
  data() {
    return { legacyData: 'legacy' }
  },
  methods: {
    legacyMethod() {
      console.log(this.legacyData)
    }
  }
}
</script>

<script setup>
// Composition API 部分
import { ref } from 'vue'
const modernData = ref('modern')
</script>
```

---

## 五、最佳实践

### 5.1 代码组织顺序

```vue
<script setup>
// 1. imports
import { ref, computed } from 'vue'
import { useUser } from './composables/useUser'

// 2. composables
const { user } = useUser()

// 3. reactive state
const count = ref(0)
const list = ref([])

// 4. computed
const total = computed(() => list.value.length)

// 5. methods
function add() { count.value++ }

// 6. lifecycle
onMounted(() => {
  console.log('mounted')
})

// 7. watchers
watch(count, (newVal) => {
  console.log('count changed:', newVal)
})
</script>
```

### 5.2 何时使用哪种 API

**使用 Options API**：
- 维护旧项目
- 小型组件（<100 行）
- 团队不熟悉 Composition API

**使用 Composition API**：
- 新项目
- 大型组件（复杂逻辑）
- 需要逻辑复用
- 需要完整的 TypeScript 支持

---

## 六、总结速查

```vue
<!-- 推荐：script setup -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 响应式状态
const state = ref(initialValue)
state.value  // 访问/修改

// 计算属性
const derived = computed(() => state.value * 2)

// 方法
const method = () => { /* ... */ }

// 生命周期
onMounted(() => { /* ... */ })

// 侦听
watch(state, (newVal, oldVal) => { /* ... */ })
</script>

<!-- 传统 setup 函数 -->
<script>
import { ref } from 'vue'
export default {
  setup() {
    const state = ref(0)
    return { state }
  }
}
</script>
```

---

**相关文章**：
- 上一篇：[Vue 3 快速上手](./vue-3-getting-started.md)
- 下一篇：[响应式系统精讲](./vue-reactivity-system.md)

**参考**：
- [Vue 3 Composition API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
