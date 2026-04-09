# 浏览器存储方案

> 从 Cookie 到 IndexedDB，浏览器提供多种存储方案。理解它们的容量、生命周期和使用场景，选择合适的存储策略。

---

## 一、存储方案概览

| 特性 | Cookie | LocalStorage | SessionStorage | IndexedDB | Cache API |
|------|--------|--------------|----------------|-----------|-----------|
| **容量** | 4KB | 5-10MB | 5-10MB | 较大（磁盘50%+） | 较大 |
| **生命周期** | 可设置过期 | 永久 | 标签页关闭 | 永久 | 可控制 |
| **服务端读取** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **作用域** | Domain/Path | 同源 | 标签页 | 同源 | Service Worker |
| **数据类型** | 字符串 | 字符串 | 字符串 | 结构化 | 二进制 |

---

## 二、Cookie

### 2.1 基本使用

```javascript
// 设置 Cookie
document.cookie = "username=Alice; path=/; max-age=86400";
// max-age：秒数
// expires：UTC 日期字符串
// path：路径
// domain：域名
// secure：仅 HTTPS
// samesite：Strict/Lax/None

// 读取 Cookie（获取所有）
console.log(document.cookie);
// "username=Alice; key2=value2"

// 删除 Cookie
document.cookie = "username=; max-age=0";
```

### 2.2 Cookie 工具函数

```javascript
const CookieUtil = {
  get(name) {
    const match = document.cookie.match(new RegExp(
      `(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`
    ));
    return match ? decodeURIComponent(match[1]) : undefined;
  },
  
  set(name, value, options = {}) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
    if (options.expires) cookie += `; expires=${options.expires.toUTCString()}`;
    if (options.path) cookie += `; path=${options.path}`;
    if (options.domain) cookie += `; domain=${options.domain}`;
    if (options.secure) cookie += "; secure";
    if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
    
    document.cookie = cookie;
  },
  
  remove(name, options = {}) {
    this.set(name, "", { ...options, maxAge: -1 });
  }
};

// 使用
CookieUtil.set("token", "abc123", { 
  maxAge: 86400 * 7,  // 7天
  secure: true,
  sameSite: "strict"
});
```

### 2.3 现代替代方案

```javascript
// 推荐使用其他存储方案，Cookie 仅用于：
// 1. 服务端需要读取（如身份验证）
// 2. 兼容旧浏览器
```

---

## 三、LocalStorage / SessionStorage

### 3.1 基本使用

```javascript
// LocalStorage：持久化存储
localStorage.setItem("theme", "dark");
localStorage.getItem("theme");     // "dark"
localStorage.removeItem("theme");
localStorage.clear();              // 清空所有

// SessionStorage：标签页级别
sessionStorage.setItem("tempData", JSON.stringify(data));
sessionStorage.getItem("tempData");

// 存储对象（需序列化）
const user = { name: "Alice", age: 25 };
localStorage.setItem("user", JSON.stringify(user));
const saved = JSON.parse(localStorage.getItem("user"));
```

### 3.2 封装工具

```javascript
class LocalStorageUtil {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === "QuotaExceededError") {
        console.error("Storage quota exceeded");
      }
      return false;
    }
  }
  
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Parse error:", e);
      return defaultValue;
    }
  }
  
  static remove(key) {
    localStorage.removeItem(key);
  }
  
  static has(key) {
    return localStorage.getItem(key) !== null;
  }
  
  // 带过期时间的存储
  static setWithExpiry(key, value, ttl) {
    const data = {
      value,
      expiry: Date.now() + ttl
    };
    this.set(key, data);
  }
  
  static getWithExpiry(key) {
    const data = this.get(key);
    if (!data) return null;
    if (Date.now() > data.expiry) {
      this.remove(key);
      return null;
    }
    return data.value;
  }
}
```

### 3.3 跨标签页通信

```javascript
// LocalStorage 变化事件
typeof window !== "undefined" && window.addEventListener("storage", (e) => {
  console.log("Key changed:", e.key);
  console.log("Old value:", e.oldValue);
  console.log("New value:", e.newValue);
  console.log("URL:", e.url);
  
  // 同步状态到其他标签页
  if (e.key === "theme") {
    applyTheme(e.newValue);
  }
});

// 发送消息给其他标签页
localStorage.setItem("broadcast", JSON.stringify({
  timestamp: Date.now(),
  data: message
}));
```

---

## 四、IndexedDB

### 4.1 基础操作

```javascript
// 打开数据库
const request = indexedDB.open("MyApp", 1);

request.onerror = () => console.error("Failed to open DB");
request.onsuccess = () => {
  const db = request.result;
  console.log("DB opened:", db.name, "v" + db.version);
};

// 首次创建或版本升级
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // 创建对象存储（表）
  if (!db.objectStoreNames.contains("users")) {
    const store = db.createObjectStore("users", { 
      keyPath: "id",           // 主键
      autoIncrement: true      // 自增
    });
    
    // 创建索引
    store.createIndex("name", "name", { unique: false });
    store.createIndex("email", "email", { unique: true });
  }
};
```

### 4.2 Promise 封装

```javascript
class IndexedDBUtil {
  constructor(dbName, version) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }
  
  open(stores) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        stores.forEach(({ name, keyPath, indexes }) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath });
            indexes?.forEach(idx => {
              store.createIndex(idx.name, idx.keyPath, { unique: idx.unique });
            });
          }
        });
      };
    });
  }
  
  add(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  update(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

---

## 五、Cache API

### 5.1 Service Worker 缓存

```javascript
// 安装时缓存核心资源
const CACHE_NAME = "app-v1";
const urlsToCache = [
  "/",
  "/styles.css",
  "/app.js",
  "/icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 拦截请求，优先使用缓存
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 命中缓存直接返回
        if (response) return response;
        
        // 否则网络请求并缓存
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
  );
});
```

---

## 六、存储策略选择

```javascript
// 决策流程
function chooseStorage(data) {
  // 1. 服务端需要读取？
  if (data.serverReadable) {
    return "cookie";  // 小数据，如 token
  }
  
  // 2. 大数据量？
  if (data.size > 5 * 1024 * 1024) {
    return "indexedDB";  // 文件、大量数据
  }
  
  // 3. 仅当前会话？
  if (data.sessionOnly) {
    return "sessionStorage";  // 表单草稿
  }
  
  // 4. 需要持久化？
  return "localStorage";  // 用户设置、缓存
}
```

---

## 七、总结速查

```javascript
// Cookie
// 小数据(4KB)，服务端可读，可设过期
document.cookie = "key=value; max-age=86400; secure; samesite=strict";

// LocalStorage
// 5-10MB，永久，仅字符串
localStorage.setItem("key", JSON.stringify(value));
JSON.parse(localStorage.getItem("key"));

// SessionStorage
// 5-10MB，标签页级别
sessionStorage.setItem("key", value);

// IndexedDB
// 大数据，结构化，支持索引
indexedDB.open("db", version);

// Cache API
// Service Worker 配合，离线缓存
caches.open("cache-name").then(cache => {
  cache.add(request);
});
```

---

**相关文章**：
- 上一篇：[事件机制深度解析](./js-event-system.md)
- 下一篇：[网络请求全攻略](./js-network-requests.md)

**参考**：
- [MDN: Web Storage](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)
- [MDN: IndexedDB](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
