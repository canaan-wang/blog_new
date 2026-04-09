# Vue 3 响应式原理源码解析

> 从 Proxy 到依赖收集，彻底理解 Vue 3 响应式系统

## 核心架构概览

Vue 3 响应式系统由三个核心模块组成：

```
┌─────────────────────────────────────────┐
│           Reactive API (ref/reactive)    │
│                 用户层接口                │
├─────────────────────────────────────────┤
│           Effect / Track / Trigger       │
│              依赖收集与触发               │
├─────────────────────────────────────────┤
│              Proxy / Reflect             │
│              底层拦截机制                 │
└─────────────────────────────────────────┘
```

---

## Proxy 拦截机制

Vue 3 使用 ES6 Proxy 替代 Object.defineProperty，解决了数组索引、对象新增属性等限制。

### Proxy 基础回顾

```js
const target = { name: 'Vue', version: 3 }

const proxy = new Proxy(target, {
  get(target, key, receiver) {
    console.log(`读取: ${String(key)}`)
    return Reflect.get(target, key, receiver)
  },
  
  set(target, key, value, receiver) {
    console.log(`设置: ${String(key)} = ${value}`)
    return Reflect.set(target, key, value, receiver)
  },
  
  has(target, key) {
    console.log(`检查属性: ${String(key)}`)
    return Reflect.has(target, key)
  },
  
  deleteProperty(target, key) {
    console.log(`删除: ${String(key)}`)
    return Reflect.deleteProperty(target, key)
  }
})

proxy.name      // 读取: name
proxy.name = 'React'  // 设置: name = React
'name' in proxy       // 检查属性: name
delete proxy.version  // 删除: version
```

### Vue 3 使用的 Proxy 陷阱

| 陷阱 | 触发场景 |
|------|----------|
| `get` | 读取属性值 |
| `set` | 设置属性值 |
| `has` | `in` 操作符 |
| `deleteProperty` | `delete` 操作符 |
| `ownKeys` | `Object.keys` / `for...in` |

---

## 依赖收集系统

### 三个核心概念

```js
// 1. Target - 原始对象
const target = { count: 0 }

// 2. Dep - 依赖集合（Set 结构，存储所有 Effect）
const dep = new Set()

// 3. Effect - 副作用函数（组件渲染、watch 回调等）
const effect = () => {
  console.log('当前值:', target.count)
}
```

### WeakMap + Map + Set 三层结构

Vue 3 使用三层嵌套结构存储依赖关系：

```js
// targetMap: WeakMap<Target, Map<Key, Dep>>
const targetMap = new WeakMap()

// 结构示意
targetMap = {
  { count: 0 } => Map {
    'count' => Set [ effect1, effect2, ... ]
  },
  { name: 'Vue' } => Map {
    'name' => Set [ effect3, ... ]
  }
}
```

**为什么是 WeakMap？**
- 当 target 不再被引用时，WeakMap 会自动释放对应 entry
- 避免内存泄漏

---

## 源码核心实现（简化版）

### reactive 实现

```js
import { mutableHandlers } from './baseHandlers'

// 缓存已创建的响应式对象
const reactiveMap = new WeakMap()

function reactive(target) {
  // 1. 非对象直接返回
  if (!isObject(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`)
    return target
  }
  
  // 2. 已经是响应式对象，直接返回
  if (target.__v_isReactive) {
    return target
  }
  
  // 3. 检查缓存
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  
  // 4. 创建 Proxy
  const proxy = new Proxy(target, mutableHandlers)
  
  // 5. 缓存并返回
  reactiveMap.set(target, proxy)
  return proxy
}
```

### 处理器 Handlers

```js
// baseHandlers.js
import { track, trigger } from './effect'

const get = createGetter()
const set = createSetter()

function createGetter(isReadonly = false) {
  return function get(target, key, receiver) {
    // 标记响应式对象
    if (key === '__v_isReactive') {
      return true
    }
    
    const res = Reflect.get(target, key, receiver)
    
    // 依赖收集
    if (!isReadonly) {
      track(target, 'get', key)
    }
    
    // 深层响应式（懒递归）
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    
    return res
  }
}

function createSetter() {
  return function set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    
    // 值变化才触发
    if (hasChanged(value, oldValue)) {
      trigger(target, 'set', key, value, oldValue)
    }
    
    return result
  }
}

export const mutableHandlers = {
  get,
  set,
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key)
    const result = Reflect.deleteProperty(target, key)
    
    if (hadKey && result) {
      trigger(target, 'delete', key)
    }
    return result
  }
}
```

### Effect 调度系统

```js
// effect.js
let activeEffect = undefined
const effectStack = []

// 目标 -> 属性 -> Effect 的映射
const targetMap = new WeakMap()

// 创建 Effect
function effect(fn, options = {}) {
  const effect = createReactiveEffect(fn, options)
  
  // 立即执行（除非 lazy: true）
  if (!options.lazy) {
    effect()
  }
  
  return effect
}

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect(...args) {
    if (!effect.active) {
      return options.scheduler ? undefined : fn(...args)
    }
    
    // 避免递归
    if (!effectStack.includes(effect)) {
      // 清理旧依赖
      cleanup(effect)
      
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn(...args)
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  
  effect.id = uid++
  effect.active = true
  effect.deps = []  // 存储所有依赖的 Dep
  effect.options = options
  
  return effect
}

// 依赖收集（Track）
function track(target, type, key) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }
  
  // 添加当前 Effect 到 Dep
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    // 反向记录，用于清理
    activeEffect.deps.push(dep)
  }
}

// 触发更新（Trigger）
function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const effects = new Set()
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        // 避免触发自己（除非允许）
        if (effect !== activeEffect) {
          effects.add(effect)
        }
      })
    }
  }
  
  // 1. 触发具体属性的 Effect
  add(depsMap.get(key))
  
  // 2. 触发迭代相关 Effect（add/delete 影响长度/for...in）
  if (type === 'add' || type === 'delete') {
    add(depsMap.get('length'))
    add(depsMap.get(ITERATE_KEY))
  }
  
  // 3. 执行所有 Effect
  effects.forEach(effect => {
    if (effect.options.scheduler) {
      // 调度执行（用于 nextTick 优化）
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })
}

// 清理 Effect 的旧依赖
function cleanup(effect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}
```

---

## ref 的实现原理

```js
function ref(value) {
  return createRef(value)
}

function createRef(rawValue) {
  if (isRef(rawValue)) {
    return rawValue
  }
  
  return new RefImpl(rawValue)
}

class RefImpl {
  private _value
  private _rawValue
  public dep = undefined
  public readonly __v_isRef = true
  
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
  }
  
  get value() {
    // 依赖收集
    trackRefValue(this)
    return this._value
  }
  
  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = convert(newVal)
      // 触发更新
      triggerRefValue(this)
    }
  }
}

function trackRefValue(ref) {
  if (activeEffect) {
    if (!ref.dep) {
      ref.dep = new Set()
    }
    trackEffects(ref.dep)
  }
}

function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}
```

**ref vs reactive 的区别：**
- `reactive`: 对对象进行 Proxy 代理
- `ref`: 包装成对象，通过 `.value` 访问，内部对对象值也用 reactive 处理

---

## 计算属性 computed 原理

```js
function computed(getterOrOptions) {
  let getter, setter
  
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => console.warn('Write failed: computed value is readonly')
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  
  return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl {
  private _value
  private _dirty = true  // 脏检查标记
  public readonly effect
  public readonly __v_isRef = true
  
  constructor(getter, private _setter) {
    // 创建 lazy effect，不立即执行
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        // 依赖变化时标记为脏
        if (!this._dirty) {
          this._dirty = true
          triggerRefValue(this)
        }
      }
    })
  }
  
  get value() {
    // 脏数据才重新计算
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
    }
    // 收集当前 computed 的依赖
    trackRefValue(this)
    return this._value
  }
  
  set value(newValue) {
    this._setter(newValue)
  }
}
```

**computed 缓存机制：**
- 通过 `_dirty` 标记实现缓存
- 只有依赖变化后才重新计算
- 多次访问未变化的计算属性直接返回缓存值

---

## watch 原理

```js
function watch(source, callback, options = {}) {
  return doWatch(source, callback, options)
}

function doWatch(source, callback, options) {
  let getter
  
  // 处理不同的 source 类型
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    options.deep = true
  } else if (isFunction(source)) {
    getter = source
  }
  
  let oldValue
  
  const job = () => {
    const newValue = effect()
    if (hasChanged(newValue, oldValue) || options.deep) {
      callback(newValue, oldValue)
      oldValue = newValue
    }
  }
  
  const effect = new ReactiveEffect(getter, job)
  
  if (options.immediate) {
    job()
  } else {
    oldValue = effect.run()
  }
  
  return () => {
    effect.stop()
  }
}
```

---

## 响应式数据流图解

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   组件 setup │───▶│ 读取 ref/.  │───▶│  track()    │
│   或 effect  │    │  value      │    │  依赖收集   │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                                             ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   更新视图  │◀───│  trigger()  │◀───│  数据变化   │
│  (re-render)│    │  触发更新   │    │  set/delete │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## 调试技巧

```js
// 开启调试模式
import { devtools } from '@vue/runtime-core'

// 查看依赖关系
const state = reactive({ count: 0 })
effect(() => {
  console.log(state.count)
}, {
  onTrack: (event) => {
    console.log('依赖收集:', event)
  },
  onTrigger: (event) => {
    console.log('触发更新:', event)
  }
})
```

---

## 常见误区

### ❌ 解构丢失响应式

```js
const state = reactive({ count: 0, name: 'Vue' })

// 错误：解构后失去响应式
const { count } = state
count++  // 不会触发更新！

// 正确：使用 toRefs
import { toRefs } from 'vue'
const { count: reactiveCount } = toRefs(state)
reactiveCount.value++  // ✅ 正常更新
```

### ❌ 直接替换数组元素

```js
const list = reactive([1, 2, 3])

// 问题：直接赋值无法触发
list[0] = 10  // 实际可以触发（Proxy 优势）

// 但数组长度变化要注意
list.length = 0  // Vue 3 可以触发清空
```

### ✅ 最佳实践

```js
// 1. 复杂对象用 reactive，基础类型用 ref
const user = reactive({ name: '', age: 0 })
const isVisible = ref(false)

// 2. 组合使用 computed 减少重复计算
const fullName = computed(() => `${user.firstName} ${user.lastName}`)

// 3. 及时清理 watch
const unwatch = watch(source, callback)
onUnmounted(() => unwatch())
```

---

## 速查表

| API | 适用场景 | 返回值类型 |
|-----|----------|-----------|
| `reactive` | 对象/数组 | Proxy |
| `ref` | 任意类型 | { value: T } |
| `computed` | 派生状态 | { value: T } |
| `readonly` | 只读保护 | Proxy |
| `shallowReactive` | 浅层响应 | Proxy |
| `shallowRef` | 浅层响应 | { value: T } |

---

## 相关文章

- 上一篇：[Vue 3 渲染函数与 JSX](./vue-render-jsx.md)
- 下一篇：Vue 3 性能优化实战
