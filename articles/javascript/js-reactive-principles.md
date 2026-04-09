# 响应式原理

> 响应式系统是 Vue、React 等框架的核心。理解依赖收集、发布订阅和响应式实现，是掌握现代框架的基础。

---

## 一、响应式概念

```
数据变化 → 通知依赖 → 自动更新视图
```

---

## 二、手动实现响应式

### 2.1 基础实现

```javascript
// 发布订阅中心
class Dep {
  constructor() {
    this.subscribers = new Set();
  }
  
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }
  
  notify() {
    this.subscribers.forEach(effect => effect());
  }
}

let activeEffect = null;

function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}

// 响应式对象
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      const dep = getDep(target, key);
      dep.depend();
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      const dep = getDep(target, key);
      dep.notify();
      return true;
    }
  });
}

const depsMap = new WeakMap();

function getDep(target, key) {
  let depMap = depsMap.get(target);
  if (!depMap) {
    depMap = new Map();
    depsMap.set(target, depMap);
  }
  
  let dep = depMap.get(key);
  if (!dep) {
    dep = new Dep();
    depMap.set(key, dep);
  }
  
  return dep;
}

// 使用
const state = reactive({ count: 0 });

watchEffect(() => {
  console.log("count:", state.count);  // 自动追踪依赖
});

state.count++;  // 自动触发更新
```

---

## 三、Vue3 vs React

### 3.1 Vue3 响应式

```javascript
// Proxy 实现
import { ref, reactive, computed, watch } from "vue";

const count = ref(0);
const user = reactive({ name: "Alice" });

const double = computed(() => count.value * 2);

watch(count, (newVal, oldVal) => {
  console.log("changed:", oldVal, "→", newVal);
});
```

### 3.2 React 响应式

```javascript
// useState + useEffect
import { useState, useEffect, useMemo } from "react";

function Component() {
  const [count, setCount] = useState(0);
  
  const double = useMemo(() => count * 2, [count]);
  
  useEffect(() => {
    console.log("count changed:", count);
  }, [count]);
  
  return <div>{count}</div>;
}
```

---

## 四、总结速查

```javascript
// 响应式核心
// 1. 依赖收集（get 时收集）
// 2. 触发更新（set 时通知）
// 3. Proxy 实现对象拦截

// Vue3
ref()      // 原始值响应式
reactive() // 对象响应式
computed() // 计算属性
watch()    // 侦听器

// React
useState()   // 状态
useEffect()  // 副作用
useMemo()    // 缓存计算
```

---

**相关文章**：
- 上一篇：[代码规范与质量](./js-code-quality.md)
- 下一篇：[虚拟 DOM 与 Diff](./js-virtual-dom.md)

**参考**：
- [Vue 响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
