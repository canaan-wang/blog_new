# 前端路由实现

> 前端路由是单页应用的核心。理解 Hash 模式和 History 模式的原理，以及路由守卫的实现。

---

## 一、两种路由模式

### 1.1 Hash 模式

```javascript
// URL: http://example.com/#/user/123
// # 后面的内容变化不触发页面刷新

class HashRouter {
  constructor() {
    this.routes = {};
    this.currentUrl = "";
    
    window.addEventListener("load", () => this.refresh());
    window.addEventListener("hashchange", () => this.refresh());
  }
  
  route(path, callback) {
    this.routes[path] = callback;
  }
  
  refresh() {
    this.currentUrl = location.hash.slice(1) || "/";
    this.routes[this.currentUrl]?.();
  }
  
  push(url) {
    location.hash = url;
  }
}

// 使用
const router = new HashRouter();
router.route("/", () => console.log("Home"));
router.route("/about", () => console.log("About"));
```

### 1.2 History 模式

```javascript
// URL: http://example.com/user/123
// 使用 History API，需要服务端配合

class HistoryRouter {
  constructor() {
    this.routes = {};
    
    window.addEventListener("popstate", () => this.refresh());
  }
  
  route(path, callback) {
    this.routes[path] = callback;
  }
  
  refresh() {
    const path = location.pathname;
    this.routes[path]?.();
  }
  
  push(url) {
    history.pushState({}, "", url);
    this.refresh();
  }
  
  replace(url) {
    history.replaceState({}, "", url);
    this.refresh();
  }
}
```

---

## 二、对比

| 特性 | Hash | History |
|------|------|---------|
| URL | 有 # | 无 # |
| 兼容性 | IE8+ | IE10+ |
| 服务端 | 不需要 | 需要配置 |
| SEO | 较差 | 正常 |

---

## 三、总结速查

```javascript
// Hash 模式
// - location.hash
// - hashchange 事件
// - 不需要服务端

// History 模式
// - history.pushState/replaceState
// - popstate 事件
// - 需要服务端配置

// 路由守卫
// - 全局 beforeEach
// - 路由独享 beforeEnter
// - 组件内 beforeRouteEnter/Update/Leave
```

---

**相关文章**：
- 上一篇：[虚拟 DOM 与 Diff](./js-virtual-dom.md)
- 下一篇：[状态管理设计](./js-state-management.md)
