# AGENTS.md - Canaan's Tech Blog

This file provides essential context for AI coding agents working on this project.

## Project Overview

这是一个基于 **Next.js 16 + React 19 + TypeScript** 构建的静态博客系统，专为 GitHub Pages 部署优化。博客采用暖色调设计理念，内容以 MDX 格式组织，支持代码高亮、Mermaid 图表和响应式布局。

### Key Characteristics

- **静态导出**：使用 `output: 'export'` 生成纯静态站点，输出目录为 `./out`
- **中文内容为主**：博客文章主要使用中文编写，界面字体针对中文显示优化
- **分层内容组织**：Domain（领域）→ Category（分类）→ Article（文章）三级结构
- **静态内容生成**：MDX 文件在构建时通过脚本编译为静态数据，存储于 `src/lib/static-content.ts`
- **暖色调主题**：米黄色背景（#fffdf8）配合橙色强调色（#f0923b）

---

## Technology Stack

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.1.6 (App Router) |
| 运行时 | React 19.2.3 |
| 语言 | TypeScript 5.x |
| 样式 | Tailwind CSS 4.x + @tailwindcss/typography |
| 内容处理 | gray-matter + next-mdx-remote |
| 代码高亮 | rehype-pretty-code + Shiki (monokai 主题) |
| 图标 | lucide-react |
| 动画 | framer-motion |
| 字体 | Noto Serif SC, Noto Sans SC, JetBrains Mono (Google Fonts) |

---

## Project Structure

```
├── content/                   # MDX 文章内容目录（构建时处理）
│   ├── {domain-slug}/         # 领域目录（如 software-dev-languages）
│   │   ├── {category}/        # 分类目录（如 golang）
│   │   │   ├── _intro.mdx     # 分类介绍文件（可选）
│   │   │   └── *.mdx          # 文章文件
│   └── ...
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [domain]/          # 领域路由（动态路由）
│   │   │   ├── [slug]/        # 文章页面路由
│   │   │   │   └── page.tsx   # 文章详情页
│   │   │   ├── layout.tsx     # 领域布局（含侧边栏）
│   │   │   ├── page.tsx       # 领域首页（展示分类概览）
│   │   │   └── CategoryContent.tsx  # 分类内容客户端组件
│   │   ├── globals.css        # 全局样式与主题变量
│   │   ├── layout.tsx         # 根布局（导航栏、页脚）
│   │   ├── page.tsx           # 首页
│   │   └── not-found.tsx      # 404 页面
│   ├── components/
│   │   ├── article/
│   │   │   └── MDXComponents.tsx    # MDX 自定义渲染组件
│   │   └── layout/
│   │       ├── Navbar.tsx           # 顶部导航栏
│   │       ├── Sidebar.tsx          # 左侧分类/文章导航
│   │       ├── TableOfContents.tsx  # 右侧目录（桌面端）
│   │       └── Footer.tsx           # 页脚
│   ├── config/
│   │   └── site.ts           # 站点配置（标题、作者等）
│   ├── lib/
│   │   ├── domains.ts        # 领域/分类定义（硬编码）
│   │   ├── content.ts        # 内容加载函数（React cache 包装）
│   │   └── static-content.ts # 自动生成的静态内容注册表
│   └── types/
│       └── index.ts          # TypeScript 类型定义
├── scripts/
│   └── generate-static-registry.ts  # 静态内容生成脚本
├── next.config.ts            # Next.js 配置（静态导出、basePath）
├── tsconfig.json             # TypeScript 配置
├── postcss.config.mjs        # PostCSS 配置（Tailwind CSS v4）
├── eslint.config.mjs         # ESLint 配置（Next.js 官方配置）
└── package.json              # 项目依赖与脚本
```

---

## Build Commands

```bash
# 开发服务器
npm run dev
# 启动在 http://localhost:3000

# 生产构建（静态导出到 ./out）
npm run build

# 本地预览生产构建
npm run start

# 代码检查
npm run lint

# 生成静态内容注册表（构建前自动执行）
npx tsx scripts/generate-static-registry.ts
```

---

## Content Architecture

### Content Hierarchy

```
Domain（领域）→ Category（分类）→ Group（分组）→ Article（文章）
```

**示例路径**：`articles/frontend/vue/overview/vue-overview.html`

- **Domain**: `frontend`（前端开发）
- **Category**: `vue`（Vue 技术栈）
- **Group**: `overview`（文章分组，用于侧边栏组织）
- **Article**: `vue-overview.html`（文章文件，HTML 格式）

### Content Generation Flow

1. **开发阶段**：在 `articles/{domain}/{category}/{group}/` 目录下编写 HTML 文件
2. **构建阶段**：`scripts/generate-static-registry.ts` 扫描 articles 目录
3. **生成阶段**：脚本解析 HTML 文件，提取标题、摘要等信息，生成 `src/lib/static-content.ts`
4. **渲染阶段**：Next.js 使用静态数据渲染页面

**重要**：`src/lib/static-content.ts` 是自动生成的文件，**不要手动编辑**。

### HTML Article Format

文章使用 HTML 格式，标题从 `<h1>` 标签自动提取，摘要从第一段 `<p>` 标签自动提取：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文章标题</title>
</head>
<body>
    <h1>文章标题</h1>
    <p>文章摘要，将作为列表中的描述显示...</p>
    <h2>章节标题</h2>
    <p>正文内容...</p>
</body>
</html>
```

**注意**：文章的分组（group）由文件路径中的目录名决定，如 `articles/frontend/vue/overview/` 中的 `overview`。

### Special Files

- **`_intro.html`**: 分类介绍文件，放置在分类目录下，用于在领域首页展示该分类的概览内容

### Content Organization Guidelines

1. **Domain slug** 使用 kebab-case（如 `software-dev-languages`）
2. **Category slug** 使用 kebab-case（如 `message-queue`）
3. **Group slug** 使用 kebab-case（如 `overview`, `basics`, `advanced`）
4. **Article slug** 从文件名自动提取（如 `vue-overview.html` → slug: `vue-overview`）
5. **文件路径必须是 4 级结构**：`articles/{domain}/{category}/{group}/{slug}.html`
6. **Group 字段** 用于侧边栏内对文章进行分组显示（如 "概述"、"基础语法"）
7. 文章按发布日期倒序排列（最新的在前）

---

## Domain & Category Configuration

所有领域和分类在 `src/lib/domains.ts` 中硬编码定义：

```typescript
// domains 数组定义所有领域
export const domains: Domain[] = [
  { slug: "ai", title: "人工智能", ... },
  { slug: "backend-languages", title: "后端开发语言", ... },
  { slug: "data-storage", title: "数据存储", ... },
  { slug: "distributed-system", title: "分布式系统", ... },
  { slug: "infrastructure", title: "基础架构", ... },
  { slug: "frontend", title: "前端开发", ... },  // 前端开发领域
  // ...
];

// categoriesByDomain 定义每个领域的分类
export const categoriesByDomain: Record<string, Category[]> = {
  "software-dev-languages": [
    { slug: "golang", title: "Golang", ... },
    { slug: "java", title: "Java", ... },
  ],
  "frontend": [  // 前端领域分类
    { slug: "html", title: "HTML", ... },
    { slug: "css", title: "CSS", ... },
    { slug: "typescript", title: "TypeScript", ... },
    { slug: "vue", title: "Vue", ... },
  ],
  // ...
};
```

**添加新 Domain/Category 必须编辑此文件**。

---

## HTML Processing Pipeline

文章渲染使用原生 HTML，处理流程如下：

### HTML Processing

1. **标题提取**: 从 `<h1>` 标签提取文章标题
2. **摘要提取**: 从第一个 `<p>` 标签提取摘要
3. **目录生成**: 从 `<h2>`、`<h3>` 标签生成文章目录
4. **代码高亮**: `rehype-pretty-code` 为代码块添加语法高亮
   - 主题：monokai
   - 保留背景色

### Custom Components

自定义渲染组件位于 `src/components/article/MDXComponents.tsx`：

- `h1`, `h2`, `h3`: 标题样式
- `a`: 链接自动识别外部链接（添加 `target="_blank"`）
- `pre`: 代码块容器样式
- `blockquote`: 引用块样式
- `table`, `th`, `td`: 表格样式
- `ul`, `ol`, `hr`: 列表和分隔线样式

---

## Styling Guidelines

### Theme Colors (CSS Variables)

```css
:root {
  --background: #fffdf8;      /* 暖白色背景 */
  --foreground: #2c2c2c;      /* 深灰文字 */
  --bg-alt: #fff7e6;          /* 备用背景（选中、悬停） */
  --accent: #f0923b;          /* 橙色强调 */
  --accent-hover: #e07b20;    /* 橙色悬停 */
  --link: #3a9d5c;            /* 绿色链接 */
  --link-hover: #2d8049;      /* 链接悬停 */
  --border: #f0e4d0;          /* 边框色 */
  --muted: #8a7e72;           /* 次要文字 */
  --sidebar-bg: #fef9f0;      /* 侧边栏背景 */
  --card-bg: #ffffff;         /* 卡片背景 */
  --card-shadow: rgba(240, 146, 59, 0.06);
  --nav-bg: rgba(255, 253, 248, 0.92); /* 导航栏背景（带透明） */
  --tag-active-bg: #f0923b;   /* 激活标签背景 */
  --tag-active-text: #ffffff; /* 激活标签文字 */
}
```

### Typography

- **正文**: Noto Sans SC / Inter
- **标题**: Noto Serif SC / Georgia
- **代码**: JetBrains Mono / ui-monospace

### Layout

- **导航栏**: 固定顶部，高度 4rem (64px)
- **主内容区**: 最大宽度 6xl (1152px)，居中
- **文章正文**: 最大宽度 3xl (768px)
- **侧边栏**: 宽度 280px，固定左侧
- **目录**: 宽度 15% (min 12rem, max 16rem)，固定右侧（仅桌面端显示）

### Sidebar Navigation Behavior

- **点击分类标签**: 自动跳转到该分类 `overview` 分组的第一篇文章
- **分组展示**: 文章按 group 字段分组，在侧边栏中折叠展示
- **默认展开**: 当前文章所在分组自动展开

---

## Key Files Reference

| 文件 | 用途 |
|------|------|
| `src/lib/domains.ts` | 领域/分类定义，添加新栏目必须修改 |
| `src/lib/content.ts` | 内容加载函数，使用 React `cache()` 进行请求级缓存 |
| `src/lib/static-content.ts` | 自动生成的静态内容注册表，**不要手动编辑** |
| `src/types/index.ts` | 类型定义（Domain, Category, ArticleMeta 等） |
| `src/config/site.ts` | 站点基本信息配置 |
| `src/app/globals.css` | 主题变量、字体、滚动条样式 |
| `scripts/generate-static-registry.ts` | 静态内容生成脚本 |
| `next.config.ts` | 静态导出配置，`basePath: '/blog_new'` 用于生产环境 |

---

## Path Aliases

所有导入使用 `@/*` 别名，映射到 `./src/*`：

```typescript
import { domains } from "@/lib/domains";
import Navbar from "@/components/layout/Navbar";
import type { Article } from "@/types";
```

---

## Deployment

### GitHub Pages 部署

- **构建输出**: `./out` 目录
- **配置**: `basePath: '/blog_new'` 在 `next.config.ts` 中定义
- **图片**: 必须使用 `unoptimized: true`（静态导出限制）

### 手动部署到 GitHub Pages

```bash
# 构建
npm run build

# 部署 out 目录到 GitHub Pages
# 可通过 GitHub Actions 工作流自动化
```

### GitHub Actions 工作流示例

如需自动部署，创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/deploy-pages@v4
        with:
          folder: out
```

---

## Development Guidelines

### Adding New Content

#### 1. 添加新领域

编辑 `src/lib/domains.ts`：
- 在 `domains` 数组中添加 Domain 定义
- 在 `categoriesByDomain` 中添加该领域的分类列表

#### 2. 添加新分类

编辑 `src/lib/domains.ts`：
- 在对应 domain 的 `categoriesByDomain[domainSlug]` 数组中添加 Category 定义
- 创建目录 `content/{domain}/{category}/`
- （可选）添加 `_intro.mdx` 介绍文件

#### 3. 添加 MDX 文章

```bash
content/{domain}/{category}/article-slug.mdx
```
- 文件名即为 URL slug
- 必须包含完整的 frontmatter
- 使用 `group` 字段控制侧边栏分组

#### 4. 重新生成静态内容

```bash
npx tsx scripts/generate-static-registry.ts
```

或重新构建：

```bash
npm run build
```

### Content Writing Tips

- 使用 Mermaid 语法绘制流程图、时序图
- 代码块指定语言以获得语法高亮
- 使用 `group` 字段将相关文章组织在一起
- 摘要（summary）用于 SEO 和列表展示

### Performance Considerations

- 内容加载函数使用 React `cache()` 进行请求级缓存
- 静态导出时所有页面在构建时预渲染
- 图片必须使用 `unoptimized: true`（静态导出限制）

---

## Code Style Guidelines

### TypeScript

- 使用严格模式（`strict: true`）
- 优先使用 `type` 定义对象形状
- 组件 Props 使用接口定义

### React

- 优先使用 Server Components（默认）
- 需要客户端交互时使用 `"use client"` 指令
- 使用 Tailwind CSS 进行样式处理

### File Naming

- 组件文件：PascalCase（如 `Sidebar.tsx`）
- 工具文件：camelCase（如 `content.ts`）
- 文章文件：kebab-case（如 `go-channel.mdx`）

---

## Common Issues

### 文章未显示

- 检查 frontmatter 中的 `draft` 是否为 `true`
- 确认 `domain` 和 `category` 与文件路径匹配
- 检查 `domains.ts` 中是否已定义该 domain/category
- 确认已重新运行内容生成脚本

### 构建失败

- 检查 MDX 语法是否正确
- 确认所有导入路径正确
- 检查 `static-content.ts` 是否已生成

### 样式问题

- 暖色调主题变量定义在 `globals.css` 的 `:root`
- Tailwind 自定义颜色在 `@theme inline` 中定义
- 确保使用正确的 CSS 变量（如 `--color-background`）

---

## Dependencies Overview

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | Next.js 框架 |
| react | 19.2.3 | React 运行时 |
| react-dom | 19.2.3 | React DOM |
| framer-motion | ^12.38.0 | 动画库 |
| next-mdx-remote | ^6.0.0 | MDX 远程渲染 |
| gray-matter | ^4.0.3 | Frontmatter 解析 |
| tailwindcss | ^4 | CSS 框架 |
| @tailwindcss/typography | ^0.5.19 | 排版样式 |
| @tailwindcss/postcss | ^4 | PostCSS 插件 |
| lucide-react | ^0.577.0 | 图标库 |
| mermaid | ^11.13.0 | Mermaid 图表渲染 |
| rehype-pretty-code | ^0.14.3 | 代码高亮 |
| rehype-slug | ^6.0.0 | 标题 ID 生成 |
| rehype-autolink-headings | ^7.1.0 | 标题自动链接 |
| remark-gfm | ^4.0.1 | GitHub Flavored Markdown |
| shiki | ^4.0.2 | 语法高亮引擎 |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5 | TypeScript 编译器 |
| @types/react | ^19 | React 类型定义 |
| @types/node | ^20 | Node.js 类型定义 |
| eslint | ^9 | 代码检查 |
| eslint-config-next | 16.1.6 | Next.js ESLint 配置 |
| tsx | ^4 | TypeScript 执行器（用于脚本）|
