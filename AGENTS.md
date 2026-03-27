# AGENTS.md - Canaan's Tech Blog

This file provides essential context for AI coding agents working on this project.

## Project Overview

这是一个基于 **Next.js 16 + React 19 + TypeScript** 构建的静态博客系统，专为 GitHub Pages 部署优化。博客采用暖色调设计理念，内容以 MDX 格式组织，支持代码高亮、Mermaid 图表和响应式布局。

### Key Characteristics

- **静态导出**：使用 `output: 'export'` 生成纯静态站点，输出目录为 `./out`
- **中文内容为主**：博客文章主要使用中文编写，界面字体针对中文显示优化
- **分层内容组织**：Domain（领域）→ Category（分类）→ Article（文章）三级结构
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
| 图表 | mermaid (客户端渲染) |
| Markdown | remark-gfm (GitHub Flavored Markdown) |
| 图标 | lucide-react |
| 字体 | Noto Serif SC, Noto Sans SC, JetBrains Mono |

---

## Project Structure

```
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages 自动部署工作流
├── content/                # MDX 文章内容目录
│   ├── {domain-slug}/      # 领域目录（如 software-dev-languages）
│   │   ├── {category}/     # 分类目录（如 golang）
│   │   │   ├── _intro.mdx  # 分类介绍文件（可选）
│   │   │   └── *.mdx       # 文章文件
│   └── ...
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── [domain]/       # 领域路由（动态路由）
│   │   │   ├── [slug]/     # 文章页面路由
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx  # 领域布局（含侧边栏）
│   │   │   ├── page.tsx    # 领域首页（展示分类概览）
│   │   │   └── CategoryContent.tsx
│   │   ├── globals.css     # 全局样式与主题变量
│   │   ├── layout.tsx      # 根布局（导航栏、页脚）
│   │   ├── page.tsx        # 首页
│   │   └── not-found.tsx   # 404 页面
│   ├── components/
│   │   ├── article/
│   │   │   └── MDXComponents.tsx  # MDX 自定义渲染组件
│   │   └── layout/
│   │       ├── Navbar.tsx         # 顶部导航栏
│   │       ├── Sidebar.tsx        # 左侧分类/文章导航
│   │       ├── TableOfContents.tsx # 右侧目录（桌面端）
│   │       └── Footer.tsx         # 页脚
│   ├── config/
│   │   └── site.ts         # 站点配置（标题、作者等）
│   ├── lib/
│   │   ├── domains.ts      # 领域/分类定义（硬编码）
│   │   └── content.ts      # 内容加载工具函数
│   └── types/
│       └── index.ts        # TypeScript 类型定义
├── next.config.ts          # Next.js 配置（静态导出、basePath）
├── tsconfig.json           # TypeScript 配置
├── postcss.config.mjs      # PostCSS 配置
└── eslint.config.mjs       # ESLint 配置
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
```

---

## Content Architecture

### Content Hierarchy

```
Domain（领域）→ Category（分类）→ Article（文章）
```

**示例路径**：`content/software-dev-languages/golang/go-channel.mdx`

- **Domain**: `software-dev-languages`（软件开发语言）
- **Category**: `golang`（Go 语言）
- **Article**: `go-channel.mdx`（Channel 文章）

### Domain Configuration

所有领域和分类在 `src/lib/domains.ts` 中硬编码定义：

```typescript
// domains 数组定义所有领域
export const domains: Domain[] = [
  { slug: "software-dev-languages", title: "软件开发语言", ... },
  { slug: "distributed-architecture", title: "分布式架构", ... },
  // ...
];

// categoriesByDomain 定义每个领域的分类
export const categoriesByDomain: Record<string, Category[]> = {
  "software-dev-languages": [
    { slug: "golang", title: "Golang", ... },
    { slug: "java", title: "Java", ... },
  ],
  // ...
};
```

**添加新 Domain/Category 必须编辑此文件**。

### Article Frontmatter Format

```yaml
---
title: "文章标题"
date: "2025-12-22"
updated: "2026-01-15"           # 可选：更新日期
summary: "文章摘要描述"
tags: ["golang", "channel"]     # 标签数组
category: "golang"              # 必须匹配分类 slug
domain: "software-dev-languages" # 必须匹配领域 slug
group: "复合数据类型"            # 侧边栏分组名称
draft: false                    # 草稿标记（true 则不会显示）
---
```

### Special Files

- **`_intro.mdx`**: 分类介绍文件，放置在分类目录下，用于在领域首页展示该分类的概览内容

### Content Organization Guidelines

1. **Domain slug** 使用 kebab-case（如 `software-dev-languages`）
2. **Category slug** 使用 kebab-case（如 `message-queue`）
3. **Article slug** 从文件名自动提取（如 `go-channel.mdx` → slug: `go-channel`）
4. **Group 字段** 用于侧边栏内对文章进行分组显示（如 "复合数据类型"、"并发编程"）
5. 文章按发布日期倒序排列（最新的在前）

---

## MDX Processing Pipeline

文章渲染使用 `next-mdx-remote/rsc`，处理流程如下：

### Remark Plugins（Markdown 处理）

1. **remark-gfm**: GitHub Flavored Markdown（表格、删除线、任务列表等）
2. **remark-mermaidjs**: Mermaid 图表渲染

### Rehype Plugins（HTML 处理）

1. **rehype-slug**: 为标题添加 ID 属性（用于目录锚点）
2. **rehype-pretty-code**: 代码块语法高亮
   - 主题：monokai
   - 保留背景色

### Custom Components

自定义 MDX 组件位于 `src/components/article/MDXComponents.tsx`：

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
  --nav-bg: rgba(255, 253, 248, 0.92); /* 导航栏背景（带透明） */
}
```

### Typography

- **正文**: Noto Sans SC / Inter
- **标题**: Noto Serif SC / Georgia
- **代码**: JetBrains Mono / ui-monospace

### Layout

- **导航栏**: 固定顶部，高度 4rem (64px)
- **主内容区**: 最大宽度 7xl (1280px)，居中
- **文章正文**: 最大宽度 3xl (768px)
- **侧边栏**: 宽度 280px，固定左侧
- **目录**: 宽度 240px，固定右侧（仅桌面端显示）

---

## Key Files Reference

| 文件 | 用途 |
|------|------|
| `src/lib/domains.ts` | 领域/分类定义，添加新栏目必须修改 |
| `src/lib/content.ts` | 内容加载函数，使用 React `cache()` 优化 |
| `src/types/index.ts` | 类型定义（Domain, Category, ArticleMeta 等） |
| `src/config/site.ts` | 站点基本信息配置 |
| `src/app/globals.css` | 主题变量、字体、滚动条样式 |
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

### GitHub Pages 自动部署

- **触发条件**: `main` 分支的 push 操作，或手动触发
- **工作流文件**: `.github/workflows/deploy.yml`
- **Node.js 版本**: 20
- **构建输出**: `./out` 目录
- **部署方式**: GitHub Actions 的 `deploy-pages` action

### Configuration for GitHub Pages

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/blog_new' : '',  // GitHub Pages 仓库名
  images: {
    unoptimized: true,  // 静态导出必须禁用图片优化
  },
};
```

---

## Development Guidelines

### Adding New Content

1. **添加新领域**: 编辑 `src/lib/domains.ts`
   - 在 `domains` 数组中添加 Domain 定义
   - 在 `categoriesByDomain` 中添加该领域的分类列表

2. **添加新分类**: 编辑 `src/lib/domains.ts`
   - 在对应 domain 的 `categoriesByDomain[domainSlug]` 数组中添加 Category 定义
   - 创建目录 `content/{domain}/{category}/`
   - （可选）添加 `_intro.mdx` 介绍文件

3. **添加新文章**: 创建 `.mdx` 文件
   ```bash
   content/{domain}/{category}/article-slug.mdx
   ```
   - 文件名即为 URL slug
   - 必须包含完整的 frontmatter
   - 使用 `group` 字段控制侧边栏分组

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

## Common Issues

### 文章未显示
- 检查 frontmatter 中的 `draft` 是否为 `true`
- 确认 `domain` 和 `category` 与文件路径匹配
- 检查 `domains.ts` 中是否已定义该 domain/category

### 构建失败
- 检查 MDX 语法是否正确
- 确认所有导入路径正确
- Mermaid 图表语法错误可能导致构建失败

### 样式问题
- 暖色调主题变量定义在 `globals.css` 的 `:root`
- Tailwind 自定义颜色在 `@theme inline` 中定义
