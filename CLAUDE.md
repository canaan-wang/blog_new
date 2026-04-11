# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于 Next.js 16 + React 19 + TypeScript 的静态博客系统，专为 GitHub Pages 部署优化。采用暖色调设计，内容以 HTML 格式组织。

## Build Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build (static export to ./out)
npm run build

# Lint code
npm run lint
```

**Important**: The build process auto-generates `src/lib/static-content.ts` from HTML files in the `articles/` directory. If content appears missing, ensure this generation step has run.

## Content Architecture

Content follows a 4-level hierarchy:

```
Domain（领域）→ Category（分类）→ Group（分组）→ Article（文章）
```

**File path format**: `articles/{domain}/{category}/{group}/{slug}.html`

Example: `articles/frontend/vue/overview/vue-overview.html`
- Domain: `frontend`
- Category: `vue`
- Group: `overview`
- Article slug: `vue-overview`

## Content Generation Pipeline

1. **Write content**: Create/edit HTML files in `articles/{domain}/{category}/{group}/`
2. **Generate registry**: `scripts/generate-static-registry.ts` scans articles directory
3. **Output**: Generates `src/lib/static-content.ts` with all article metadata and content
4. **Render**: Next.js uses static data for SSG

**Note**: `src/lib/static-content.ts` is auto-generated — **do not edit manually**.

## Domain & Category Configuration

All domains and categories are hardcoded in `src/lib/domains.ts`:

- `domains`: Array of Domain objects
- `categoriesByDomain`: Record mapping domain slug to Category array
- `groupsByCategory`: Record mapping category slug to Group array

**Adding new domains/categories requires editing this file**.

## Key Directories

```
articles/                     # HTML content source files
├── {domain}/
│   └── {category}/
│       ├── _intro.html       # Optional category intro
│       └── {group}/
│           └── *.html        # Article files
src/
├── app/[domain]/             # Dynamic domain routes
│   ├── [slug]/page.tsx       # Article detail page
│   ├── layout.tsx            # Domain layout with sidebar
│   └── page.tsx              # Domain index (redirects to first article)
├── lib/
│   ├── domains.ts            # Domain/category definitions
│   ├── content.ts            # Content loading functions (uses React cache)
│   └── static-content.ts     # AUTO-GENERATED - do not edit
└── components/
    ├── article/              # Article rendering components
    └── layout/               # Layout components (Navbar, Sidebar, etc.)
```

## Styling

- **CSS Framework**: Tailwind CSS v4
- **Theme colors**: Defined in `src/app/globals.css`
  - Background: `#fffdf8` (warm white)
  - Accent: `#f0923b` (orange)
  - Link: `#3a9d5c` (green)
- **Fonts**: Noto Serif SC (headings), Noto Sans SC (body), JetBrains Mono (code)

## Important Implementation Details

### Static Export Configuration
- `next.config.ts` sets `output: 'export'` for static generation
- `basePath: '/blog_new'` is used in production for GitHub Pages
- Images use `unoptimized: true` (static export requirement)

### HTML Article Format
```html
<h1>Article Title</h1>
<p>Summary paragraph (extracted automatically)</p>
<h2>Section Heading</h2>
<!-- h2/h3 headings get auto-generated IDs for table of contents -->
```

### Content Loading
- `src/lib/content.ts` provides cached content loading via React `cache()`
- Article metadata extracted from HTML: title (from h1), summary (from first p), date (from file mtime)
- Headings (h2/h3) get IDs added for table of contents linking

### Path Aliases
Use `@/*` to import from `src/*`:
```typescript
import { domains } from "@/lib/domains";
import Navbar from "@/components/layout/Navbar";
```
