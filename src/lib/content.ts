import { cache } from "react";
import fs from "fs";
import path from "path";
import type {
  ArticleMeta,
  Article,
  SidebarData,
  DomainWithCategories,
} from "@/types";
import { domains, getCategories, getDomain, getGroupTitle } from "./domains";

const ARTICLES_DIR = path.join(process.cwd(), "articles");

/**
 * 递归获取目录下所有 HTML 文件
 */
function getAllHtmlFiles(dir: string, baseDir: string = dir): { relativePath: string; fullPath: string }[] {
  const files: { relativePath: string; fullPath: string }[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ relativePath, fullPath });
    }
  }
  
  return files;
}

/**
 * 为 HTML 中的标题添加 id 属性
 */
function addHeadingIds(html: string): string {
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u4e00-\u9fa5-]/g, "")
      .substring(0, 50);
  };

  // 为 h2 和 h3 添加 id
  let idCounter = 0;
  return html
    .replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, content) => {
      const id = slugify(content) || `heading-${++idCounter}`;
      return `<h2${attrs} id="${id}">${content}</h2>`;
    })
    .replace(/<h3([^>]*)>(.*?)<\/h3>/gi, (match, attrs, content) => {
      const id = slugify(content) || `heading-${++idCounter}`;
      return `<h3${attrs} id="${id}">${content}</h3>`;
    });
}

/**
 * 从 HTML 内容中提取标题（第一个 h1 标签）
 */
function extractTitle(html: string): string | null {
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  return h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : null;
}

/**
 * 从 HTML 内容中提取摘要（第一段文字）
 */
function extractSummary(html: string): string {
  const cleanedHtml = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  const pMatch = cleanedHtml.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pMatch) {
    return pMatch[1].replace(/<[^>]+>/g, "").trim().substring(0, 200);
  }
  const textMatch = cleanedHtml.match(/<h1[^>]*>.*?<\/h1>\s*(.*?)(?:<|$)/i);
  if (textMatch) {
    return textMatch[1].replace(/<[^>]+>/g, "").trim().substring(0, 200);
  }
  return "";
}

/**
 * 从文件路径解析 domain、category、group
 * 路径格式: articles/{domain}/{category}/{group}/{slug}.html
 */
function parseArticlePath(relativePath: string): { domain: string; category: string; group: string; slug: string } | null {
  const parts = relativePath.split(path.sep);
  // 至少需要 4 级：domain/category/group/slug.html
  if (parts.length < 4) return null;
  
  const domain = parts[0];
  const category = parts[1];
  const group = parts[2];
  const slug = parts[parts.length - 1].replace(/\.html$/, "");
  
  return { domain, category, group, slug };
}

/**
 * 读取文章文件并解析为元数据
 */
function readArticle(filePath: string): Article | null {
  const relativePath = path.relative(ARTICLES_DIR, filePath);
  const parsed = parseArticlePath(relativePath);
  if (!parsed) return null;
  
  const { domain, category, group, slug } = parsed;
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const content = addHeadingIds(rawContent);
  const title = extractTitle(content) || slug;
  const summary = extractSummary(content);
  
  // 获取文件修改时间作为日期
  let date = "1970-01-01";
  try {
    const stats = fs.statSync(filePath);
    date = stats.mtime.toISOString().split("T")[0];
  } catch {}
  
  return {
    slug,
    domain,
    category,
    title,
    date,
    summary,
    group,
    draft: false,
    content,
  };
}

/**
 * 获取所有文章
 */
function getAllArticles(): Article[] {
  const files = getAllHtmlFiles(ARTICLES_DIR);
  const articles: Article[] = [];
  
  for (const { fullPath } of files) {
    const article = readArticle(fullPath);
    if (article) {
      articles.push(article);
    }
  }
  
  // 按日期排序
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 缓存所有文章数据
const allArticlesCache = getAllArticles();

export const getAllDomains = cache(async () => {
  return domains;
});

export const getDomainWithCategories = cache(
  async (domainSlug: string): Promise<DomainWithCategories | null> => {
    const domain = getDomain(domainSlug);
    if (!domain) return null;
    const categories = getCategories(domainSlug);
    return { ...domain, categories };
  }
);

export const getArticlesByDomain = cache(
  async (domainSlug: string): Promise<ArticleMeta[]> => {
    return allArticlesCache
      .filter(a => a.domain === domainSlug)
      .map(({ content, ...meta }) => meta);
  }
);

export const getArticlesByCategory = cache(
  async (
    domainSlug: string,
    categorySlug: string
  ): Promise<ArticleMeta[]> => {
    return allArticlesCache
      .filter(a => a.domain === domainSlug && a.category === categorySlug)
      .map(({ content, ...meta }) => meta);
  }
);

export const getArticleBySlug = cache(
  async (domainSlug: string, slug: string): Promise<Article | null> => {
    return allArticlesCache.find(
      a => a.domain === domainSlug && a.slug === slug
    ) || null;
  }
);

export const getSidebarData = cache(
  async (domainSlug: string): Promise<SidebarData | null> => {
    const domain = getDomain(domainSlug);
    if (!domain) return null;
    
    const categories = getCategories(domainSlug);
    const sidebarCategories = categories.map(cat => {
      const articles = allArticlesCache
        .filter(a => a.domain === domainSlug && a.category === cat.slug)
        .map(({ content, ...meta }) => meta)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // 检查是否有分类介绍文件
      const introPath = path.join(ARTICLES_DIR, domainSlug, cat.slug, "_intro.html");
      const hasIntro = fs.existsSync(introPath);
      
      return { ...cat, articles, hasIntro };
    });
    
    return { domain, categories: sidebarCategories };
  }
);

export const getCategoryIntro = cache(
  async (
    domainSlug: string,
    categorySlug: string
  ): Promise<{ content: string; title: string; summary: string } | null> => {
    const introPath = path.join(ARTICLES_DIR, domainSlug, categorySlug, "_intro.html");
    if (!fs.existsSync(introPath)) return null;
    
    const content = fs.readFileSync(introPath, "utf-8");
    const title = extractTitle(content) || `${categorySlug} 概览`;
    const summary = extractSummary(content);
    
    return { content, title, summary };
  }
);

export const getAllArticleSlugs = cache(async () => {
  return allArticlesCache.map(a => ({ domain: a.domain, slug: a.slug }));
});

// 导出获取分组标题的辅助函数
export { getGroupTitle };
