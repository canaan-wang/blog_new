import type { Domain, Category } from "@/types";

export const domains: Domain[] = [
  {
    slug: "software-dev-languages",
    title: "软件开发语言",
    description: "探索各种编程语言的设计哲学与实践",
    icon: "code",
    order: 1,
  },
  {
    slug: "distributed-architecture",
    title: "分布式架构",
    description: "分布式系统的设计、实现与最佳实践",
    icon: "network",
    order: 2,
  },
  {
    slug: "data-governance",
    title: "数据治理",
    description: "数据质量、数据目录与数据管理",
    icon: "database",
    order: 3,
  },
  {
    slug: "software-design",
    title: "软件设计",
    description: "设计模式、系统设计与领域驱动设计",
    icon: "compass",
    order: 4,
  },
  {
    slug: "frontend-development",
    title: "前端开发",
    description: "Web 前端技术栈，涵盖 HTML、CSS、JavaScript、移动端开发等",
    icon: "monitor",
    order: 5,
  },
  {
    slug: "ai",
    title: "人工智能",
    description: "AI 技术探索，涵盖大语言模型、机器学习、提示工程与 AI 应用开发",
    icon: "brain",
    order: 6,
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
  "frontend-development": [
    {
      slug: "html",
      title: "HTML",
      description: "HTML 标记语言与语义化",
      order: 1,
      domainSlug: "frontend-development",
    },
    {
      slug: "css",
      title: "CSS",
      description: "CSS 样式、布局与动画",
      order: 2,
      domainSlug: "frontend-development",
    },
    {
      slug: "javascript",
      title: "JavaScript",
      description: "JavaScript 核心语法与特性",
      order: 3,
      domainSlug: "frontend-development",
    },
    {
      slug: "typescript",
      title: "TypeScript",
      description: "TypeScript 类型系统与最佳实践",
      order: 4,
      domainSlug: "frontend-development",
    },
    {
      slug: "frameworks",
      title: "前端框架",
      description: "React、Vue、Angular 等主流框架",
      order: 5,
      domainSlug: "frontend-development",
    },
    {
      slug: "mobile",
      title: "移动端开发",
      description: "React Native、Flutter、小程序等移动端技术",
      order: 6,
      domainSlug: "frontend-development",
    },
    {
      slug: "engineering",
      title: "前端工程化",
      description: "构建工具、性能优化与工程实践",
      order: 7,
      domainSlug: "frontend-development",
    },
  ],
  "software-dev-languages": [
    {
      slug: "golang",
      title: "Golang",
      description: "Go 语言核心概念与最佳实践",
      order: 1,
      domainSlug: "software-dev-languages",
    },
    {
      slug: "java",
      title: "Java",
      description: "Java 语言与生态系统",
      order: 2,
      domainSlug: "software-dev-languages",
    },
    {
      slug: "python",
      title: "Python",
      description: "Python 编程与数据科学",
      order: 3,
      domainSlug: "software-dev-languages",
    },
    {
      slug: "frontend",
      title: "Web 前端",
      description: "HTML、CSS、JavaScript 与前端框架",
      order: 4,
      domainSlug: "software-dev-languages",
    },
  ],
  "distributed-architecture": [
    {
      slug: "microservices",
      title: "微服务",
      description: "微服务架构设计与实践",
      order: 1,
      domainSlug: "distributed-architecture",
    },
    {
      slug: "message-queue",
      title: "消息队列",
      description: "Kafka、RabbitMQ 等消息中间件",
      order: 2,
      domainSlug: "distributed-architecture",
    },
    {
      slug: "service-mesh",
      title: "服务网格",
      description: "Istio、Envoy 等服务网格技术",
      order: 3,
      domainSlug: "distributed-architecture",
    },
    {
      slug: "cache",
      title: "缓存",
      description: "Redis 等缓存技术与分布式缓存策略",
      order: 4,
      domainSlug: "distributed-architecture",
    },
    {
      slug: "container",
      title: "容器化",
      description: "Docker、Kubernetes 等容器技术",
      order: 5,
      domainSlug: "distributed-architecture",
    },
  ],
  "data-governance": [
    {
      slug: "data-quality",
      title: "数据质量",
      description: "数据质量评估与管理",
      order: 1,
      domainSlug: "data-governance",
    },
    {
      slug: "data-catalog",
      title: "数据目录",
      description: "元数据管理与数据目录建设",
      order: 2,
      domainSlug: "data-governance",
    },
    {
      slug: "etl-pipeline",
      title: "ETL 管道",
      description: "数据抽取、转换与加载",
      order: 3,
      domainSlug: "data-governance",
    },
    {
      slug: "mysql",
      title: "MySQL",
      description: "MySQL 数据库核心特性与优化",
      order: 4,
      domainSlug: "data-governance",
    },
    {
      slug: "elasticsearch",
      title: "ElasticSearch",
      description: "ElasticSearch 搜索引擎与查询语法",
      order: 5,
      domainSlug: "data-governance",
    },
  ],
  "software-design": [
    {
      slug: "design-patterns",
      title: "设计模式",
      description: "经典设计模式与实际应用",
      order: 1,
      domainSlug: "software-design",
    },
    {
      slug: "system-design",
      title: "系统设计",
      description: "大规模系统的设计与架构",
      order: 2,
      domainSlug: "software-design",
    },
    {
      slug: "ddd",
      title: "领域驱动设计",
      description: "DDD 战略与战术设计",
      order: 3,
      domainSlug: "software-design",
    },
    {
      slug: "api-design",
      title: "API 设计",
      description: "RESTful API 与 RPC 接口设计",
      order: 4,
      domainSlug: "software-design",
    },
    {
      slug: "cs-fundamentals",
      title: "计算机基础",
      description: "计算机网络、数据结构与数据库原理",
      order: 5,
      domainSlug: "software-design",
    },
  ],
};

export function getDomain(slug: string): Domain | undefined {
  return domains.find((d) => d.slug === slug);
}

export function getCategories(domainSlug: string): Category[] {
  return categoriesByDomain[domainSlug] || [];
}
