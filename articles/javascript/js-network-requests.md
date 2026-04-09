# 网络请求全攻略

> 从 XMLHttpRequest 到 Fetch API 再到 Axios，JavaScript 网络请求不断演进。理解它们的差异、错误处理、取消机制，是构建健壮应用的基础。

---

## 一、请求方式演进

```
XMLHttpRequest → Fetch API → Axios/封装库
    (传统)         (现代)        (生产)
```

---

## 二、XMLHttpRequest

### 2.1 基础用法

```javascript
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.example.com/data", true);

xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) { // 请求完成
    if (xhr.status === 200) {
      console.log(JSON.parse(xhr.responseText));
    } else {
      console.error("Error:", xhr.statusText);
    }
  }
};

xhr.onerror = () => console.error("Network error");
xhr.ontimeout = () => console.error("Timeout");

xhr.timeout = 5000;
xhr.setRequestHeader("Content-Type", "application/json");
xhr.send();
```

### 2.2 状态码

| readyState | 含义 |
|-----------|------|
| 0 | UNSENT - 未初始化 |
| 1 | OPENED - open() 已调用 |
| 2 | HEADERS_RECEIVED - 已接收响应头 |
| 3 | LOADING - 接收响应体中 |
| 4 | DONE - 请求完成 |

---

## 三、Fetch API

### 3.1 基础用法

```javascript
// GET 请求
fetch("https://api.example.com/users")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error(error));

// POST 请求
fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  body: JSON.stringify({ name: "Alice", age: 25 })
});
```

### 3.2 响应处理

```javascript
fetch("/api/data")
  .then(response => {
    // 响应信息
    console.log(response.status);      // 200
    console.log(response.statusText);  // "OK"
    console.log(response.ok);          // true (200-299)
    console.log(response.headers.get("Content-Type"));
    
    // 解析方式
    response.json();   // JSON
    response.text();   // 文本
    response.blob();   // 二进制
    response.formData();
    response.arrayBuffer();
  });
```

### 3.3 高级用法

```javascript
// AbortController 取消请求
const controller = new AbortController();

fetch("/api/slow", { 
  signal: controller.signal 
})
  .then(response => response.json())
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Request cancelled");
    }
  });

// 5秒后取消
setTimeout(() => controller.abort(), 5000);

// 流式读取（大文件）
fetch("/api/large-file")
  .then(response => {
    const reader = response.body.getReader();
    
    return new ReadableStream({
      start(controller) {
        function pump() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            console.log(`Received ${value.length} bytes`);
            controller.enqueue(value);
            return pump();
          });
        }
        return pump();
      }
    });
  });
```

---

## 四、请求封装

### 4.1 Fetch 封装

```javascript
class HttpClient {
  constructor(baseURL = "", options = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    };
  }
  
  async request(url, options = {}) {
    const fullURL = this.baseURL + url;
    const controller = new AbortController();
    
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      },
      signal: controller.signal
    };
    
    // 自动 JSON 序列化
    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }
    
    const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);
    
    try {
      const response = await fetch(fullURL, config);
      clearTimeout(timeout);
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        throw error;
      }
      
      // 根据 Content-Type 自动解析
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return response.json();
      }
      return response.text();
      
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }
  
  get(url, options) {
    return this.request(url, { ...options, method: "GET" });
  }
  
  post(url, data, options) {
    return this.request(url, { ...options, method: "POST", body: data });
  }
  
  put(url, data, options) {
    return this.request(url, { ...options, method: "PUT", body: data });
  }
  
  delete(url, options) {
    return this.request(url, { ...options, method: "DELETE" });
  }
}

// 使用
const api = new HttpClient("https://api.example.com", {
  headers: { "Authorization": "Bearer token" }
});

api.get("/users")
  .then(users => console.log(users))
  .catch(err => console.error(err));
```

### 4.2 Axios 风格封装

```javascript
// 拦截器支持
class AxiosLikeClient extends HttpClient {
  constructor(baseURL, options) {
    super(baseURL, options);
    this.interceptors = {
      request: [],
      response: []
    };
  }
  
  useRequestInterceptor(onFulfilled, onRejected) {
    this.interceptors.request.push({ onFulfilled, onRejected });
  }
  
  useResponseInterceptor(onFulfilled, onRejected) {
    this.interceptors.response.push({ onFulfilled, onRejected });
  }
  
  async request(url, options) {
    // 请求拦截
    let config = { url, ...options };
    for (const interceptor of this.interceptors.request) {
      try {
        config = await interceptor.onFulfilled?.(config) || config;
      } catch (error) {
        interceptor.onRejected?.(error);
        throw error;
      }
    }
    
    // 执行请求
    try {
      let response = await super.request(config.url, config);
      
      // 响应拦截
      for (const interceptor of this.interceptors.response) {
        response = await interceptor.onFulfilled?.(response) || response;
      }
      
      return response;
    } catch (error) {
      for (const interceptor of this.interceptors.response) {
        interceptor.onRejected?.(error);
      }
      throw error;
    }
  }
}

// 使用拦截器
const client = new AxiosLikeClient("https://api.example.com");

client.useRequestInterceptor(config => {
  console.log("Request:", config.url);
  return config;
});

client.useResponseInterceptor(
  response => response,
  error => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    throw error;
  }
);
```

---

## 五、并发控制

```javascript
// Promise.all - 全部成功
const [users, posts] = await Promise.all([
  fetch("/users").then(r => r.json()),
  fetch("/posts").then(r => r.json())
]);

// Promise.allSettled - 获取所有结果
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b")
]);

// 限制并发数
async function concurrentLimit(tasks, limit) {
  const results = [];
  const executing = [];
  
  for (const [index, task] of tasks.entries()) {
    const promise = task().then(result => ({ index, result }));
    results.push(promise);
    
    if (tasks.length >= limit) {
      executing.push(promise);
      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
  }
  
  return Promise.all(results).then(arr => 
    arr.sort((a, b) => a.index - b.index).map(a => a.result)
  );
}

// 使用
const urls = ["/api/1", "/api/2", "/api/3", "/api/4", "/api/5"];
const tasks = urls.map(url => () => fetch(url).then(r => r.json()));

const results = await concurrentLimit(tasks, 2);  // 最多2个并发
```

---

## 六、错误处理

```javascript
// 分类处理
async function safeRequest(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (error.name === "TypeError" && !navigator.onLine) {
      // 网络断开
      throw new NetworkError("You are offline");
    }
    if (error.name === "AbortError") {
      // 请求取消/超时
      throw new TimeoutError("Request timeout");
    }
    throw error;
  }
}

// 重试机制
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === maxRetries) throw error;
      await delay(1000 * Math.pow(2, i));  // 指数退避
    }
  }
}
```

---

## 七、总结速查

```javascript
// Fetch API
fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
  signal: controller.signal  // 取消
});

// 响应处理
response.ok        // 200-299
response.status    // HTTP 状态码
response.json()    // 解析 JSON

// 取消请求
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort();

// 并发
Promise.all([p1, p2, p3]);
Promise.race([p1, p2]);      // 最快完成
Promise.allSettled([p1, p2]); // 全部完成

// 错误处理
if (!response.ok) throw new Error("Failed");
```

---

**相关文章**：
- 上一篇：[浏览器存储方案](./js-storage.md)
- 下一篇：[性能优化实战](./js-performance-optimization.md)

**参考**：
- [MDN: Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
- [Axios](https://axios-http.com/)
