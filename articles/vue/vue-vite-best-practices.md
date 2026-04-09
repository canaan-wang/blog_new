# Vite + Vue 3 最佳实践指南

> 从项目配置到构建优化，打造高性能开发体验

## Vite 核心优势

Vite 凭借原生 ESM 和 esbuild 预构建，解决了传统构建工具的痛点：

| 特性 | Webpack | Vite |
|------|---------|------|
| 冷启动 | 数秒~数十秒 | 毫秒级 |
| HMR | 随项目规模变慢 | 始终快速 |
| 构建速度 | 中等 | 快（esbuild + Rollup）|
| 配置复杂度 | 高 | 低 |

---

## 项目初始化

### 官方模板

```bash
# npm 7+
npm create vue@latest

# 或 npx
npx create-vue@latest

# 选项说明
✔ Project name: my-project
✔ Add TypeScript? … Yes
✔ Add JSX Support? … No
✔ Add Vue Router? … Yes
✔ Add Pinia? … Yes
✔ Add Vitest? … Yes
✔ Add Cypress? … No
✔ Add ESLint? … Yes
✔ Add Prettier? … Yes
```

### 手动配置

```bash
npm init -y
npm install vue@next
npm install -D vite @vitejs/plugin-vue
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  }
})
```

```json
// package.json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 开发环境配置

### 路径别名

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
})
```

```json
// tsconfig.json (TypeScript 项目)
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
```

### 代理配置

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      // 基础代理
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      
      // WebSocket 代理
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      }
    }
  }
})
```

### HMR 优化

```js
// vite.config.js
export default defineConfig({
  server: {
    hmr: {
      overlay: false,  // 关闭错误遮罩
      port: 24678      // 指定 HMR 端口
    },
    watch: {
      usePolling: true  // Docker/WSL 环境下启用
    }
  }
})
```

---

## 插件生态

### 常用插件清单

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    
    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      }
    }),
    
    // 自动导入组件
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ]
})
```

### 图标自动化

```js
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        IconsResolver({
          prefix: 'i',  // <i-ep-edit />
          enabledCollections: ['ep', 'carbon']
        })
      ]
    }),
    Icons({
      autoInstall: true
    })
  ]
})
```

---

## 构建优化

### 代码分割

```js
// vite.config.js
export default defineConfig({
  build: {
    // 块大小警告阈值
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // 手动分块
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus'],
          'utils': ['lodash-es', 'dayjs', 'axios']
        },
        
        // 资源文件命名
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return 'img/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'fonts/[name]-[hash][extname]'
          }
          return '[ext]/[name]-[hash][extname]'
        }
      }
    }
  }
})
```

### 压缩配置

```js
// vite.config.js
import { defineConfig } from 'vite'
import { terser } from 'rollup-plugin-terser'

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  }
})
```

### 环境变量

```js
// .env.development
VITE_APP_TITLE=My App (Dev)
VITE_API_BASE_URL=/api

// .env.production
VITE_APP_TITLE=My App
VITE_API_BASE_URL=https://api.example.com
```

```js
// 代码中使用
console.log(import.meta.env.VITE_APP_TITLE)
```

```ts
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## CSS 处理

### CSS 预处理器

```bash
npm install -D sass
```

```js
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables.scss" as *;
          @use "@/styles/mixins.scss" as *;
        `
      }
    }
  }
})
```

### CSS Modules

```vue
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">标题</h1>
  </div>
</template>

<style module>
.container {
  padding: 20px;
}
.title {
  font-size: 24px;
}
</style>
```

### 原子化 CSS

```js
// vite.config.js
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS()
  ]
})
```

```js
// uno.config.js
import { defineConfig } from 'unocss'

export default defineConfig({
  shortcuts: {
    'btn': 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600',
    'card': 'bg-white rounded-lg shadow-md p-6'
  }
})
```

---

## 类型支持

### TypeScript 完整配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vue 类型声明

```ts
// src/shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

---

## 测试配置

### Vitest

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
})
```

```ts
// src/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, {
      props: { label: 'Click me' }
    })
    expect(wrapper.text()).toContain('Click me')
  })
})
```

---

## 部署优化

### 多环境构建

```js
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    base: env.VITE_BASE_URL || '/',
    build: {
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: mode === 'production' ? {
            'vendor': ['vue', 'vue-router', 'pinia']
          } : undefined
        }
      }
    }
  }
})
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 性能优化清单

### 开发阶段

- [ ] 启用 HMR，配置合理的 watch 选项
- [ ] 使用路径别名简化导入
- [ ] 配置代理解决跨域
- [ ] 使用自动导入减少样板代码

### 构建阶段

- [ ] 代码分割（路由/ vendor/ 动态导入）
- [ ] 资源压缩（JS/CSS/图片）
- [ ] 移除 console 和 debugger
- [ ] 生成 sourcemap（生产环境按需）
- [ ] 配置 CDN 加速（可选）

### 部署阶段

- [ ] Gzip/Brotli 压缩
- [ ] 静态资源长期缓存
- [ ] 开启 HTTP/2
- [ ] 配置合适的 base URL

---

## 常见问题

### 模块找不到

```bash
# 清除缓存
rm -rf node_modules
rm package-lock.json
npm install
```

### HMR 不生效

```js
// vite.config.js
export default defineConfig({
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
})
```

### 生产环境路径错误

```js
// vite.config.js
export default defineConfig({
  base: './',  // 或根据部署环境配置
})
```

---

## 速查表

| 需求 | 配置 |
|------|------|
| 路径别名 | `resolve.alias` |
| 代理 | `server.proxy` |
| 自动导入 | `unplugin-auto-import` |
| 组件自动导入 | `unplugin-vue-components` |
| 代码分割 | `build.rollupOptions.output.manualChunks` |
| CSS 预处理器 | `css.preprocessorOptions` |
| 环境变量 | `.env` 文件 + `import.meta.env` |

---

## 相关文章

- 上一篇：[Vue 3 大规模列表优化](./vue-large-list-optimization.md)
- 下一篇：Nuxt 3 入门到实战
