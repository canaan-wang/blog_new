# 性能优化实战

> 性能优化是前端工程师的核心技能。从加载优化到运行时优化，本文涵盖实战中最有效的优化策略。

---

## 一、加载优化

### 1.1 资源压缩

```javascript
// 构建时优化
// webpack/vite 配置
{
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  }
}
```

### 1.2 懒加载

```javascript
// 路由懒加载
const Home = () => import("./views/Home.vue");
const About = () => import("./views/About.vue");

// 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import("./HeavyComponent.vue")
);

// 图片懒加载
// HTML
// <img loading="lazy" src="image.jpg" />

// Intersection Observer 实现
const lazyImages = document.querySelectorAll("img[data-src]");

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach((img) => imageObserver.observe(img));
```

### 1.3 预加载/预获取

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="/critical.css" as="style" />
<link rel="preload" href="/font.woff2" as="font" crossorigin />

<!-- 预获取下一页 -->
<link rel="prefetch" href="/about.js" />

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com" />
<link rel="preconnect" href="//api.example.com" crossorigin />
```

---

## 二、代码优化

### 2.1 防抖与节流

```javascript
// 防抖：输入搜索
const debouncedSearch = debounce((query) => {
  fetchSearchResults(query);
}, 300);

input.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});

// 节流：滚动/拖拽
const throttledScroll = throttle(() => {
  updateScrollIndicator();
}, 16);  // ~60fps

window.addEventListener("scroll", throttledScroll);
```

### 2.2 Web Worker

```javascript
// heavy-computation.worker.js
self.addEventListener("message", (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
});

function heavyComputation(data) {
  // CPU 密集型任务
  return data.map((x) => expensiveOperation(x));
}

// main.js
const worker = new Worker("./heavy-computation.worker.js");

worker.postMessage(largeData);
worker.onmessage = (e) => {
  console.log("Result:", e.data);
};
```

### 2.3 虚拟列表

```javascript
// 只渲染可视区域（见 DOM 操作篇）
class VirtualList {
  // 实现略，见 DOM 操作文章
}
```

---

## 三、渲染优化

### 3.1 减少重排

```javascript
// ❌ 交替读写
for (let i = 0; i < elements.length; i++) {
  const height = elements[i].offsetHeight;  // 读
  elements[i].style.height = height * 2 + "px";  // 写
}

// ✅ 批量读写
const heights = elements.map((el) => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + "px";
});

// ✅ 使用 transform
element.style.transform = "translateX(100px)";  // 合成层
```

### 3.2 requestAnimationFrame

```javascript
// 平滑动画
function smoothScrollTo(targetY) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  const duration = 500;
  const startTime = performance.now();
  
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    
    window.scrollTo(0, startY + diff * ease);
    
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}
```

---

## 四、缓存策略

### 4.1 HTTP 缓存

```
Cache-Control: max-age=31536000  // 1年，长期缓存
Cache-Control: no-cache          // 每次验证
Cache-Control: no-store          // 不缓存
ETag: "abc123"                   // 资源标识
Last-Modified: Mon, 01 Jan 2024  // 修改时间
```

### 4.2 Service Worker 缓存

```javascript
// 缓存策略：Stale-While-Revalidate
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("dynamic").then(async (cache) => {
      const cached = await cache.match(event.request);
      
      const fetchPromise = fetch(event.request).then((response) => {
        cache.put(event.request, response.clone());
        return response;
      });
      
      return cached || fetchPromise;
    })
  );
});
```

---

## 五、性能指标

### 5.1 Core Web Vitals

| 指标 | 目标 | 说明 |
|------|------|------|
| **LCP** | < 2.5s | 最大内容绘制 |
| **FID** | < 100ms | 首次输入延迟 |
| **CLS** | < 0.1 | 累积布局偏移 |

### 5.2 性能测量

```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getLCP(console.log);

// Performance API
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});
observer.observe({ entryTypes: ["measure", "navigation"] });

// 自定义测量
performance.mark("start");
doSomething();
performance.mark("end");
performance.measure("task", "start", "end");
```

---

## 六、总结速查

```javascript
// 加载优化
// - 代码分割、懒加载
// - 资源压缩
// - 预加载关键资源

// 代码优化
// - 防抖节流
// - Web Worker
// - 虚拟列表

// 渲染优化
// - 减少重排重绘
// - 使用 transform
// - requestAnimationFrame

// 缓存
// - HTTP 缓存策略
// - Service Worker
// - 内存缓存

// 指标
// LCP, FID, CLS
// Performance API
```

---

**相关文章**：
- 上一篇：[网络请求全攻略](./js-network-requests.md)
- 下一篇：[TypeScript 速通](./js-typescript.md)

**参考**：
- [Web Vitals](https://web.dev/vitals/)
- [Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)
