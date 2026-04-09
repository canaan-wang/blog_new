# 响应式系统精讲

> Vue 3 的响应式系统基于 Proxy 实现，相比 Vue 2 的 Object.defineProperty 有更完整的特性和更好的性能。深入理解 ref 和 reactive 的区别至关重要。

---

## 一、ref 详解

### 1.1 基本用法

```javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count)     // RefImpl { value: 0 }
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

### 1.2 为什么需要 .value

```javascript
// 基本类型无法被 Proxy 拦截
const primitive = 0
primitive = 1  // 只是重新赋值，无法追踪

// ref 用对象包装，通过 .value 访问实现响应式
const wrapper = { value: 0 }
// Proxy 可以拦截 wrapper.value 的读取和设置
```

### 1.3 在模板中自动解包

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const obj = {
  nested: ref(1)  // 嵌套 ref 不会自动解包
}
</script>

<template>
  <!-- 自动解包，无需 .value -->
  <div>{{ count }}</div>
  
  <!-- 嵌套的 ref 需要显式 .value -->
  <div>{{ obj.nested.value }}</div>
</template>
```

### 1.4 ref 的类型

```javascript
import { ref } from 'vue'

// 原始类型
const num = ref(0)
const str = ref('hello')
const bool = ref(true)

// 引用类型（也可以用 ref）
const arr = ref([1, 2, 3])
const obj = ref({ name: 'Alice' })

// 修改引用类型
arr.value.push(4)        // ✅ 响应式
obj.value.name = 'Bob'   // ✅ 响应式
obj.value = { age: 25 }  // ✅ 整个替换也是响应式
```

---

## 二、reactive 详解

### 2.1 基本用法

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: 'Alice',
    age: 25
  }
})

// 直接访问属性，无需 .value
console.log(state.count)  // 0
state.count++
```

### 2.2 reactive 的限制

```javascript
// ❌ 只能用于对象类型（Object、Array、Map、Set）
const num = reactive(0)  // 警告：value cannot be made reactive

// ❌ 解构会失去响应性
const state = reactive({ x: 1, y: 2 })
const { x, y } = state
x++  // 不会影响 state.x

// ❌ 替换整个对象会失去响应性
let state = reactive({ count: 0 })
state = { count: 1 }  // 原响应式连接丢失

// ✅ 解决方案：使用 Object.assign
Object.assign(state, { count: 1 })

// ✅ 或改为使用 ref
const stateRef = ref({ count: 0 })
stateRef.value = { count: 1 }  // 保持响应式
```

### 2.3 集合类型支持

```javascript
const map = reactive(new Map())
map.set('key', 'value')
console.log(map.get('key'))

const set = reactive(new Set())
set.add(1)
set.has(1)
```

---

## 三、ref vs reactive 选择指南

| 场景 | 推荐 | 原因 |
|------|------|------|
| 原始类型（string, number, boolean）| **ref** | reactive 不支持 |
| 对象需要整体替换 | **ref** | reactive 替换会丢失响应性 |
| 复杂对象，属性修改频繁 | **reactive** | 无需 .value，代码简洁 |
| 需要从函数返回响应式对象 | **reactive** | 解构需配合 toRefs |
| 不确定用什么 | **ref** | 更灵活，可应对所有场景 |

---

## 四、响应式工具函数

### 4.1 toRef 和 toRefs

```javascript
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  foo: 1,
  bar: 2
})

// toRef：为单个属性创建 ref
const fooRef = toRef(state, 'foo')
fooRef.value++  // state.foo 也会变

// toRefs：解构时保持响应性
function useFeature() {
  const state = reactive({
    x: 1,
    y: 2
  })
  
  // 返回 toRefs，外部可以解构
  return toRefs(state)
}

// 使用时可解构
const { x, y } = useFeature()
x.value++  // 保持响应式连接
```

### 4.2 isRef 和 isReactive

```javascript
import { isRef, isReactive, unref } from 'vue'

const a = ref(0)
const b = reactive({})

isRef(a)        // true
isReactive(b)   // true

// unref：是 ref 返回 value，否则返回原值
unref(a)  // 0（number）
unref(b)  // b（Proxy 对象）
```

### 4.3 shallowRef 和 shallowReactive

```javascript
// shallowRef：只追踪 .value 的替换
const state = shallowRef({ nested: { count: 0 } })

state.value = { nested: { count: 1 } }  // ✅ 触发更新
state.value.nested.count++               // ❌ 不触发更新

// shallowReactive：只顶层属性响应式
const obj = shallowReactive({
  nested: { count: 0 }
})

obj.nested = { count: 1 }  // ✅ 触发更新
obj.nested.count++          // ❌ 不触发更新

// 使用场景：大型数据、性能优化、外部库集成
```

### 4.4 triggerRef 和 toRaw

```javascript
// triggerRef：强制触发 shallowRef 更新
deepState.value.nested.count++
triggerRef(deepState)  // 手动触发

// toRaw：获取原始对象（非响应式）
const raw = toRaw(reactiveObj)  // 普通对象
```

---

## 五、响应式丢失场景

### 5.1 解构丢失

```javascript
const state = reactive({ count: 0 })

// ❌ 解构后丢失响应性
let { count } = state
count++  // 不影响 state

// ✅ 使用 toRefs
import { toRefs } from 'vue'
const { count } = toRefs(state)
count.value++  // 影响 state
```

### 5.2 函数参数传递

```javascript
const state = reactive({ count: 0 })

// ❌ 传递属性值，失去响应性
function increment(num) {
  num++
}
increment(state.count)

// ✅ 传递整个对象或 ref
function incrementState(state) {
  state.count++
}
incrementState(state)
```

### 5.3 数组索引和长度

```javascript
const arr = reactive([1, 2, 3])

// ✅ Vue 3 Proxy 支持索引和长度
arr[0] = 10      // 响应式
arr.length = 2   // 响应式
arr.push(4)      // 响应式
```

---

## 六、总结速查

```javascript
import { 
  ref, reactive, 
  toRef, toRefs, 
  isRef, isReactive,
  shallowRef, shallowReactive,
  triggerRef, toRaw
} from 'vue'

// ref：任意类型，需 .value
const r = ref(0)
r.value++

// reactive：仅对象，直接访问
const obj = reactive({ count: 0 })
obj.count++

// 解构保持响应性：toRefs
const { a, b } = toRefs(reactive({ a: 1, b: 2 }))

// 浅层响应式：性能优化
const shallow = shallowRef({ deep: { nested: 0 } })
```

---

**相关文章**：
- 上一篇：[Composition API 详解](./vue-composition-api.md)
- 下一篇：[计算属性与侦听器](./vue-computed-watchers.md)

**参考**：
- [Vue 3 响应式基础](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html)
