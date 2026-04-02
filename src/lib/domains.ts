import type { Domain, Category } from "@/types";

export interface Group {
  slug: string;
  title: string;
  categorySlug: string;
  order: number;
}

export const domains: Domain[] = [
  {
    slug: "ai",
    title: "人工智能",
    description: "AI 技术探索，涵盖大语言模型、机器学习、提示工程与 AI 应用开发",
    icon: "brain",
    order: 1,
  },
];

export const categoriesByDomain: Record<string, Category[]> = {
  "ai": [
    {
      slug: "llm",
      title: "大语言模型",
      description: "LLM 原理、微调与部署实践",
      order: 1,
      domainSlug: "ai",
    },
    {
      slug: "machine-learning",
      title: "机器学习",
      description: "机器学习算法与理论基础",
      order: 2,
      domainSlug: "ai",
    },
    {
      slug: "prompt-engineering",
      title: "提示工程",
      description: "Prompt 设计技巧与最佳实践",
      order: 3,
      domainSlug: "ai",
    },
    {
      slug: "ai-application",
      title: "AI 应用开发",
      description: "基于 AI 的应用构建与工程化",
      order: 4,
      domainSlug: "ai",
    },
    {
      slug: "multimodal-ai",
      title: "多模态 AI",
      description: "图像、语音、视频等多模态技术",
      order: 5,
      domainSlug: "ai",
    },
  ],
};

// 分组配置：每个分类下的分组定义
export const groupsByCategory: Record<string, Group[]> = {
  // AI 领域 - order 越小越靠前，overview 默认为 1
  "llm": [
    { slug: "overview", title: "LLM 概述", categorySlug: "llm", order: 1 },
    { slug: "advanced", title: "进阶技术", categorySlug: "llm", order: 2 },
  ],
  "machine-learning": [
    { slug: "overview", title: "机器学习概述", categorySlug: "machine-learning", order: 1 },
    { slug: "basics", title: "基础理论", categorySlug: "machine-learning", order: 2 },
    { slug: "algorithms", title: "算法实践", categorySlug: "machine-learning", order: 3 },
  ],
  "prompt-engineering": [
    { slug: "overview", title: "提示工程概述", categorySlug: "prompt-engineering", order: 1 },
    { slug: "basics", title: "基础技巧", categorySlug: "prompt-engineering", order: 2 },
    { slug: "advanced", title: "高级技巧", categorySlug: "prompt-engineering", order: 3 },
  ],
  "ai-application": [
    { slug: "overview", title: "AI 应用概述", categorySlug: "ai-application", order: 1 },
    { slug: "agent", title: "Agent 开发", categorySlug: "ai-application", order: 2 },
    { slug: "integration", title: "应用集成", categorySlug: "ai-application", order: 3 },
  ],
  "multimodal-ai": [
    { slug: "overview", title: "多模态概述", categorySlug: "multimodal-ai", order: 1 },
    { slug: "practice", title: "实践应用", categorySlug: "multimodal-ai", order: 2 },
  ],
};

export function getDomain(slug: string): Domain | undefined {
  return domains.find((d) => d.slug === slug);
}

export function getCategories(domainSlug: string): Category[] {
  return categoriesByDomain[domainSlug] || [];
}

export function getGroups(categorySlug: string): Group[] {
  const groups = groupsByCategory[categorySlug] || [];
  return [...groups].sort((a, b) => a.order - b.order);
}

export function getGroupTitle(categorySlug: string, groupSlug: string): string {
  const groups = groupsByCategory[categorySlug];
  if (!groups) return groupSlug;
  const group = groups.find((g) => g.slug === groupSlug);
  return group?.title || groupSlug;
}
