# 状态管理设计

> 状态管理是大型应用的核心。理解 Redux、Vuex/Pinia 的设计思想，掌握单向数据流。

---

## 一、核心概念

```
State → View → Action → State
  ↑                    ↓
  └────── Reducer ←────┘

单向数据流：可预测、易调试
```

---

## 二、手写 Redux

```javascript
// 创建 Store
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  
  function getState() {
    return state;
  }
  
  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(fn => fn());
    return action;
  }
  
  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
  
  // 初始化
  dispatch({ type: "@@redux/INIT" });
  
  return { getState, dispatch, subscribe };
}

// Reducer
function counterReducer(state = 0, action) {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
}

// 使用
const store = createStore(counterReducer);

store.subscribe(() => {
  console.log("Count:", store.getState());
});

store.dispatch({ type: "INCREMENT" });  // Count: 1
```

---

## 三、对比

| 特性 | Redux | Vuex | Pinia |
|------|-------|------|-------|
| 学习曲线 | 陡 | 中等 | 平缓 |
| 代码量 | 多 | 中等 | 少 |
| TS 支持 | 良好 | 一般 | 优秀 |
| 推荐 | 复杂项目 | Vue2 | Vue3 |

---

## 四、总结速查

```javascript
// 核心概念
// State: 状态
// Action: 描述变化
// Reducer: 纯函数，返回新状态
// Store: 状态容器

// 原则
// - 单一数据源
// - State 只读
// - 纯函数修改

// 现代替代
// - Zustand
// - Jotai
// - Recoil
```

---

**相关文章**：
- 上一篇：[前端路由实现](./js-frontend-router.md)
- 下一篇：[组件通信模式](./js-component-communication.md)

**参考**：
- [Redux 文档](https://redux.js.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
