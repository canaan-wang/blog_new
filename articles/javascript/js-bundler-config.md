# Webpack/Vite 配置

> 现代前端离不开构建工具。Webpack 生态丰富，Vite 极速开发，理解它们的配置和原理，提升开发效率。

---

## 一、Webpack 核心概念

```
Entry → Loaders → Plugins → Output
   ↓       ↓          ↓        ↓
入口   模块转换   功能扩展   输出
```

---

## 二、Webpack 基础配置

```javascript
// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",  // development/production
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash:8].js",
    clean: true
  },
  
  module: {
    rules: [
      // JavaScript
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      // CSS
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"]
      },
      // 图片
      {
        test: /\.(png|svg|jpg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: { maxSize: 8 * 1024 }
        }
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ],
  
  devServer: {
    static: "./dist",
    hot: true,
    port: 3000
  },
  
  optimization: {
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
};
```

---

## 三、Vite 配置

### 3.1 基础配置

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components")
    }
  },
  
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  },
  
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["antd"]
        }
      }
    }
  }
});
```

### 3.2 Vite 特点

```javascript
// 开发时：ESM 原生支持，极速冷启动
// 构建时：Rollup 打包，高度优化

// 环境变量
// .env
deployedVITE_API_URL=/api

// 代码中使用
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 四、对比与选择

| 特性 | Webpack | Vite |
|------|---------|------|
| 冷启动 | 慢（需打包） | 快（原生 ESM） |
| HMR | 中等 | 极快 |
| 生态 | 丰富 | 快速增长 |
| 配置 | 复杂 | 简单 |
| 生产构建 | 优化成熟 | Rollup，优秀 |
| 适用场景 | 大型项目 | 现代项目，快速开发 |

---

## 五、总结速查

```javascript
// Webpack 核心
// - Entry：入口
// - Output：输出
// - Loader：模块转换
// - Plugin：功能扩展
// - Mode：模式优化

// Vite 优势
// - 原生 ESM 开发服务器
// - 极速 HMR
// - 开箱即用
// - Rollup 生产构建

// 选择
// - 新项目：优先 Vite
// - 大型遗留项目：Webpack
// - 需要深度定制：Webpack
```

---

**相关文章**：
- 上一篇：[Babel 与转译原理](./js-babel-transpilation.md)
- 下一篇：[单元测试实战](./js-unit-testing.md)

**参考**：
- [Webpack 官方文档](https://webpack.js.org/)
- [Vite 官方文档](https://vitejs.dev/)
