# Props 与 Emits

> 组件通信的基础是 Props 向下传递、Emits 向上通知。掌握类型声明、验证和最佳实践，构建健壮的组件接口。

---

## 一、Props 基础

### 1.1 声明方式

```vue
<script setup>
// 简单声明
const props = defineProps(['title', 'count'])

// 带类型声明
const props = defineProps({
  title: String,
  count: Number,
  isActive: Boolean,
  items: Array,
  config: Object,
  callback: Function,
  uniqueId: Symbol
})
</script>
```

### 1.2 TypeScript 声明（推荐）

```vue
<script setup lang="ts">
// 类型声明方式
interface Props {
  title: string
  count?: number        // 可选
  isActive?: boolean    // 可选
}

const props = defineProps<Props>()

// 带默认值（使用 withDefaults）
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
</script>
```

### 1.3 完整的 Props 配置

```vue
<script setup>
defineProps({
  // 基础类型检查
  propA: Number,
  
  // 多个类型
  propB: [String, Number],
  
  // 必填
  propC: {
    type: String,
    required: true
  },
  
  // 默认值
  propD: {
    type: Number,
    default: 100
  },
  
  // 对象/数组默认值必须用工厂函数
  propE: {
    type: Object,
    default() {
      return { message: 'hello' }
    }
  },
  
  // 自定义验证
  propF: {
    validator(value) {
      return ['success', 'warning', 'danger'].includes(value)
    }
  },
  
  // 完整的类型定义
  propG: {
    type: String,
    required: true,
    default: 'default',
    validator(value) {
      return value.length > 0
    }
  }
})
</script>
```

---

## 二、Emits 基础

### 2.1 声明方式

```vue
<script setup>
// 简单声明
const emit = defineEmits(['update', 'delete', 'submit'])

// 带验证
const emit = defineEmits({
  update: (value) => typeof value === 'string',
  delete: (id) => typeof id === 'number'
})

// 使用
function handleClick() {
  emit('update', 'new value')
  emit('delete', 123)
}
</script>
```

### 2.2 TypeScript 声明

```vue
<script setup lang="ts">
// 类型声明方式
const emit = defineEmits<{
  update: [value: string]      // 具名元组语法
  delete: [id: number]
  submit: [data: FormData]
}>()

// 使用
function handleSubmit() {
  emit('submit', new FormData())
}
</script>
```

---

## 三、v-model 双向绑定

### 3.1 单个 v-model

```vue
<!-- ChildInput.vue -->
<script setup>
const model = defineModel()  // Vue 3.4+ 宏

// 或传统方式
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input 
    v-model="model" 
    /- 或 -/
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
```

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import ChildInput from './ChildInput.vue'

const message = ref('')
</script>

<template>
  <ChildInput v-model="message" />
  <p>{{ message }}</p>
</template>
```

### 3.2 多个 v-model

```vue
<!-- UserForm.vue -->
<script setup>
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
</script>

<template>
  <input v-model="firstName" />
  <input v-model="lastName" />
</template>
```

```vue
<!-- Parent.vue -->
<UserForm 
  v-model:first-name="user.firstName"
  v-model:last-name="user.lastName"
/>
```

### 3.3 v-model 修饰符

```vue
<script setup>
// 自定义修饰符
const [model, modifiers] = defineModel({
  set(value) {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  }
})
</script>
```

```vue
<!-- 使用修饰符 -->
<MyInput v-model.capitalize="myText" />
```

---

## 四、最佳实践

### 4.1 Props 命名

```vue
<script setup>
// ✅ camelCase 在 JS 中
defineProps({
  greetingText: String,
  isPublished: Boolean
})
</script>

<template>
  <!-- kebab-case 在模板中 -->
  <MyComponent 
    greeting-text="Hello"
    :is-published="true" 
  />
</template>
```

### 4.2 不要修改 Props

```vue
<script setup>
const props = defineProps(['initialCount'])

// ❌ 错误：直接修改 props
props.initialCount++

// ✅ 正确：使用本地状态或计算属性
import { ref } from 'vue'
const count = ref(props.initialCount)
count.value++

// 或
const localCount = computed({
  get: () => props.initialCount,
  set: (val) => emit('update:count', val)
})
</script>
```

### 4.3 Props 解构（Vue 3.5+）

```vue
<script setup>
// 响应式解构（保持响应性）
const { title, count = 0 } = defineProps(['title', 'count'])

// title 和 count 是响应式的
console.log(title)  // 不需要 .value
</script>
```

---

## 五、总结速查

```vue
<script setup>
// Props 声明
defineProps(['title'])
defineProps({ title: String, count: { type: Number, default: 0 } })
const props = defineProps<{ title: string; count?: number }>()

// Emits 声明
defineEmits(['update'])
defineEmits({ update: (val) => typeof val === 'string' })
const emit = defineEmits<{ update: [value: string] }>()

// v-model (Vue 3.4+)
const model = defineModel()
const modelValue = defineModel('modelValue')
const title = defineModel('title')

// 使用
emit('update', value)
</script>
```

---

**相关文章**：
- 上一篇：[生命周期钩子](./vue-lifecycle-hooks.md)
- 下一篇：[插槽 Slots 完全指南](./vue-slots.md)

**参考**：
- [Vue Props](https://cn.vuejs.org/guide/components/props.html)
- [Vue 事件](https://cn.vuejs.org/guide/components/events.html)
