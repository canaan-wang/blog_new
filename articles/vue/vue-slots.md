# 插槽 Slots 完全指南

> 插槽是 Vue 组件实现内容分发的机制，让你可以创建更灵活、可复用的组件。从基础用法到高级模式，全面掌握 Slots。

---

## 一、默认插槽

### 1.1 基础用法

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-header">{{ title }}</div>
    <div class="card-body">
      <!-- 插槽出口 -->
      <slot>默认内容</slot>
    </div>
  </div>
</template>
```

```vue
<!-- 使用 -->
<Card title="标题">
  <p>这是卡片内容</p>
  <button>操作</button>
</Card>

<!-- 不提供内容时显示默认 -->
<Card title="空卡片" />
```

---

## 二、具名插槽

### 2.1 声明多个插槽

```vue
<!-- Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header">默认 Header</slot>
    </header>
    
    <main>
      <slot>默认内容</slot>
    </main>
    
    <footer>
      <slot name="footer">默认 Footer</slot>
    </footer>
  </div>
</template>
```

### 2.2 使用具名插槽

```vue
<!-- 旧语法 -->
<Layout>
  <template #header>
    <h1>我的网站</h1>
  </template>
  
  <p>主要内容</p>
  
  <template #footer>
    <p>© 2024</p>
  </template>
</Layout>

<!-- # 是 v-slot: 的简写 -->
<Layout>
  <template v-slot:header>
    <h1>我的网站</h1>
  </template>
</Layout>
```

---

## 三、作用域插槽

### 3.1 传递数据给父组件

```vue
<!-- List.vue -->
<script setup>
defineProps(['items'])
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index">
        {{ item.name }} <!-- 默认显示 -->
      </slot>
    </li>
  </ul>
</template>
```

```vue
<!-- 使用作用域插槽 -->
<script setup>
import { ref } from 'vue'
import List from './List.vue'

const users = ref([
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 }
])
</script>

<template>
  <List :items="users">
    <template #default="{ item, index }">
      <div class="user-card">
        <span>{{ index + 1 }}. {{ item.name }}</span>
        <badge>{{ item.age }}岁</badge>
      </div>
    </template>
  </List>
</template>
```

### 3.2 解构插槽 Props

```vue
<!-- 解构写法 -->
<List :items="users">
  <template #default="{ item: user, index }">
    <!-- item 重命名为 user -->
    {{ user.name }}
  </template>
</List>

<!-- 更简洁的解构 -->
<List :items="users" v-slot="{ item }">
  {{ item.name }}
</List>
```

---

## 四、高级用法

### 4.1 动态插槽名

```vue
<script setup>
import { ref } from 'vue'

const currentTab = ref('header')
</script>

<template>
  <Layout>
    <template #[currentTab]>
      动态内容：{{ currentTab }}
    </template>
  </Layout>
</template>
```

### 4.2 条件插槽

```vue
<!-- 检查插槽是否有内容 -->
<template>
  <div class="card">
    <div v-if="$slots.header" class="header">
      <slot name="header" />
    </div>
    
    <div v-if="$slots.default" class="body">
      <slot />
    </div>
  </div>
</template>
```

### 4.3 渲染作用域

```vue
<!-- 插槽内容可以访问父组件数据 -->
<script setup>
import { ref } from 'vue'

const parentMsg = ref('来自父组件')
const user = ref({ name: 'Alice' })
</script>

<template>
  <Child>
    <!-- 可以访问 parentMsg 和 user -->
    <p>{{ parentMsg }} - {{ user.name }}</p>
  </Child>
</template>
```

---

## 五、插槽组合模式

### 5.1 表头/表体组件

```vue
<!-- DataTable.vue -->
<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          <slot :name="`header-${col.key}`" :column="col">
            {{ col.title }}
          </slot>
        </th>
      </tr>
    </thead>
    
    <tbody>
      <tr v-for="row in data" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
            {{ row[col.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

```vue
<!-- 使用 -->
<DataTable :columns="columns" :data="users">
  <template #header-age="{ column }">
    🎂 {{ column.title }}
  </template>
  
  <template #cell-age="{ value }">
    <span :class="{ young: value < 30 }">{{ value }}岁</span>
  </template>
</DataTable>
```

---

## 六、总结速查

```vue
<!-- 默认插槽 -->
<slot>默认内容</slot>

<!-- 具名插槽 -->
<slot name="header"></slot>

<!-- 作用域插槽 -->
<slot :item="item" :index="index"></slot>

<!-- 使用 -->
<MyComponent>
  <!-- 默认 --> 内容
  
  <!-- 具名 -->
  <template #header>Header</template>
  
  <!-- 作用域 -->
  <template #default="{ item, index }">
    {{ item.name }}
  </template>
</MyComponent>

<!-- 条件渲染 -->
<div v-if="$slots.header"><slot name="header" /></div>
```

---

**相关文章**：
- 上一篇：[Props 与 Emits](./vue-props-emits.md)
- 下一篇：[Provide / Inject](./vue-provide-inject.md)

**参考**：
- [Vue 插槽](https://cn.vuejs.org/guide/components/slots.html)
