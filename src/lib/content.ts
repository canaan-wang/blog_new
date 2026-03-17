import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { cache } from "react";
import type {
  ArticleMeta,
  Article,
  SidebarData,
  DomainWithCategories,
} from "@/types";
import { domains, getCategories, getDomain } from "./domains";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readMdxFiles(dirPath: string): { slug: string; raw: string }[] {
  if (!fs.existsSync(dirPath)) return [];
  const files: { slug: string; raw: string }[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.isFile() &&
      entry.name.endsWith(".mdx") &&
      entry.name !== "_intro.mdx"
    ) {
      const slug = entry.name.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dirPath, entry.name), "utf-8");
      files.push({ slug, raw });
    }
  }
  return files;
}

function readIntroFile(
  dirPath: string
): { raw: string; content: string } | null {
  const introPath = path.join(dirPath, "_intro.mdx");
  if (!fs.existsSync(introPath)) return null;
  const raw = fs.readFileSync(introPath, "utf-8");
  const { content } = matter(raw);
  return { raw, content };
}

function parseArticleMeta(slug: string, raw: string): ArticleMeta | null {
  const { data } = matter(raw);
  if (data.draft === true) return null;
  return {
    slug,
    title: data.title || slug,
    date: data.date || "1970-01-01",
    updated: data.updated,
    summary: data.summary || "",
    tags: data.tags || [],
    category: data.category || "",
    domain: data.domain || "",
    group: data.group || "未分类",
    draft: data.draft || false,
  };
}

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
    const categories = getCategories(domainSlug);
    const articles: ArticleMeta[] = [];
    for (const cat of categories) {
      const catDir = path.join(CONTENT_DIR, domainSlug, cat.slug);
      const files = readMdxFiles(catDir);
      for (const file of files) {
        const meta = parseArticleMeta(file.slug, file.raw);
        if (meta) {
          meta.category = cat.slug;
          meta.domain = domainSlug;
          articles.push(meta);
        }
      }
    }
    return articles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
);

export const getArticlesByCategory = cache(
  async (
    domainSlug: string,
    categorySlug: string
  ): Promise<ArticleMeta[]> => {
    const catDir = path.join(CONTENT_DIR, domainSlug, categorySlug);
    const files = readMdxFiles(catDir);
    const articles: ArticleMeta[] = [];
    for (const file of files) {
      const meta = parseArticleMeta(file.slug, file.raw);
      if (meta) {
        meta.category = categorySlug;
        meta.domain = domainSlug;
        articles.push(meta);
      }
    }
    return articles.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
);

export const getArticleBySlug = cache(
  async (domainSlug: string, slug: string): Promise<Article | null> => {
    const categories = getCategories(domainSlug);
    for (const cat of categories) {
      const filePath = path.join(
        CONTENT_DIR,
        domainSlug,
        cat.slug,
        `${slug}.mdx`
      );
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);
        return {
          slug,
          title: data.title || slug,
          date: data.date || "1970-01-01",
          updated: data.updated,
          summary: data.summary || "",
          tags: data.tags || [],
          category: cat.slug,
          domain: domainSlug,
          group: data.group || "未分类",
          draft: data.draft || false,
          content,
        };
      }
    }
    return null;
  }
);

export const getSidebarData = cache(
  async (domainSlug: string): Promise<SidebarData | null> => {
    const domain = getDomain(domainSlug);
    if (!domain) return null;
    const categories = getCategories(domainSlug);
    const sidebarCategories = await Promise.all(
      categories.map(async (cat) => {
        const articles = await getArticlesByCategory(domainSlug, cat.slug);
        const catDir = path.join(CONTENT_DIR, domainSlug, cat.slug);
        const hasIntro = readIntroFile(catDir) !== null;
        return { ...cat, articles, hasIntro };
      })
    );
    return { domain, categories: sidebarCategories };
  }
);

export const getCategoryIntro = cache(
  async (
    domainSlug: string,
    categorySlug: string
  ): Promise<{ content: string; title: string; summary: string } | null> => {
    const catDir = path.join(CONTENT_DIR, domainSlug, categorySlug);
    const intro = readIntroFile(catDir);
    if (!intro) return null;
    const { data, content } = matter(intro.raw);
    return {
      content,
      title: data.title || `${categorySlug} 概览`,
      summary: data.summary || "",
    };
  }
);

export const getAllArticleSlugs = cache(async () => {
  const slugs: { domain: string; slug: string }[] = [];
  for (const domain of domains) {
    const articles = await getArticlesByDomain(domain.slug);
    for (const article of articles) {
      slugs.push({ domain: domain.slug, slug: article.slug });
    }
  }
  return slugs;
});
