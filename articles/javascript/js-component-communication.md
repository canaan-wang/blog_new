# 组件通信模式

> 组件通信是前端开发的基础。从 Props/Events 到 Context、事件总线，掌握各种场景的最佳实践。

---

## 一、通信方式总览

| 方式 | 场景 | 范围 |
|------|------|------|
| Props/Events | 父子通信 | 直接 |
| Event Bus | 任意组件 | 全局 |
| Context/Provide | 跨层级 | 层级 |
| State Management | 全局状态 | 应用 |
| Refs | 直接访问 | 父子 |

---

## 二、React 通信

```jsx
// Props 向下传递
function Parent() {
  const [count, setCount] = useState(0);
  return <Child count={count} onIncrement={() => setCount(c => c + 1)} />;
}

// Context 跨层级
const ThemeContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <DeepChild />
    </ThemeContext.Provider>
  );
}

function DeepChild() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}
```

---

## 三、Vue 通信

```vue
<!-- Props / Emits -->
<!-- Parent.vue -->
<template>
  <Child :message="msg" @update="handleUpdate" />
</template>

<!-- Child.vue -->
<script setup>
const props = defineProps(['message']);
const emit = defineEmits(['update']);
emit('update', 'new value');
</script>

<!-- Provide / Inject -->
<!-- Parent -->
<script setup>
provide('user', { name: 'Alice' });
</script>

<!-- Deep Child -->
<script setup>
const user = inject('user');
</script>
```

---

## 四、事件总线

```javascript
// 简单实现
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    (this.events[event] ||= []).push(callback);
    return () => this.off(event, callback);
  }
  
  emit(event, ...args) {
    this.events[event]?.forEach(cb => cb(...args));
  }
  
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
}

// 全局实例
export const bus = new EventBus();

// 使用
// A 组件
bus.emit('user:login', { id: 1 });

// B 组件
const unsubscribe = bus.on('user:login', (user) => {
  console.log(user);
});

// 清理
unsubscribe();
```

---

## 五、选择指南

```
父子组件 → Props/Events
深层嵌套 → Context/Provide
任意组件 → Event Bus（简单）/ Store（复杂）
全局状态 → State Management
```

---

## 六、总结速查

```javascript
// React
props / onXXX      // 父子
useContext         // 跨层级
useState/useReducer // 状态管理

// Vue
props / emit       // 父子
provide / inject   // 跨层级
EventBus           // 任意组件
Pinia/Vuex         // 全局状态

// 原则
// - 优先 Props 单向数据流
// - 避免过度使用 EventBus
// - 全局状态用 Store
```

---

**相关文章**：
- 上一篇：[状态管理设计](./js-state-management.md)

**参考**：
- [React Composition](https://react.dev/learn/thinking-in-react)
- [Vue 组件通信](https://vuejs.org/guide/components/props.html)
