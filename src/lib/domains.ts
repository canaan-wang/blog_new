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
  {
    slug: "backend-languages",
    title: "后端开发语言",
    description: "后端编程语言学习笔记，包括 Go、Java 等语言的语法、特性与最佳实践",
    icon: "code",
    order: 2,
  },
  {
    slug: "data-storage",
    title: "数据存储",
    description: "数据库与缓存技术，包括关系型数据库、NoSQL、缓存方案",
    icon: "database",
    order: 3,
  },
  {
    slug: "distributed-system",
    title: "分布式系统",
    description: "分布式架构设计与实践，微服务、消息队列、分布式理论",
    icon: "network",
    order: 4,
  },
  {
    slug: "infrastructure",
    title: "基础架构",
    description: "基础设施与运维，Linux、容器、云原生、监控",
    icon: "server",
    order: 5,
  },
  {
    slug: "frontend",
    title: "前端开发",
    description: "前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、Vue、React 等",
    icon: "layout",
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
    {
      slug: "spec-coding",
      title: "技术规范编码",
      description: "AI 辅助编码规范、工程化最佳实践、代码质量提升指南",
      order: 6,
      domainSlug: "ai",
    },
  ],
  "backend-languages": [
    {
      slug: "golang",
      title: "Golang",
      description: "Go 语言基础、并发编程、标准库与最佳实践",
      order: 1,
      domainSlug: "backend-languages",
    },
    {
      slug: "java",
      title: "Java",
      description: "Java 语言基础、JVM、并发编程、Spring 生态",
      order: 2,
      domainSlug: "backend-languages",
    },
  ],
  "data-storage": [
    {
      slug: "redis",
      title: "Redis",
      description: "Redis 数据类型、持久化、集群与应用",
      order: 1,
      domainSlug: "data-storage",
    },
    {
      slug: "mysql",
      title: "MySQL",
      description: "MySQL 索引、优化、事务、复制与分库分表",
      order: 2,
      domainSlug: "data-storage",
    },
    {
      slug: "elasticsearch",
      title: "Elasticsearch",
      description: "全文搜索引擎，数据建模与查询优化",
      order: 3,
      domainSlug: "data-storage",
    },
    {
      slug: "influxdb",
      title: "InfluxDB",
      description: "时序数据库，高性能数据写入与查询，适用于监控和 IoT 场景",
      order: 4,
      domainSlug: "data-storage",
    },
  ],
  "distributed-system": [
    {
      slug: "microservices",
      title: "微服务架构",
      description: "微服务设计、Spring Cloud、服务治理",
      order: 1,
      domainSlug: "distributed-system",
    },
    {
      slug: "message-queue",
      title: "消息队列",
      description: "Kafka、RocketMQ、RabbitMQ 消息中间件",
      order: 2,
      domainSlug: "distributed-system",
    },
    {
      slug: "distributed-theory",
      title: "分布式理论",
      description: "CAP、BASE、一致性算法、分布式事务",
      order: 3,
      domainSlug: "distributed-system",
    },
    {
      slug: "service-governance",
      title: "服务治理",
      description: "注册中心、配置中心、限流熔断、链路追踪",
      order: 4,
      domainSlug: "distributed-system",
    },
  ],
  "infrastructure": [
    {
      slug: "linux",
      title: "Linux",
      description: "Linux 命令、Shell 脚本、性能调优",
      order: 1,
      domainSlug: "infrastructure",
    },
    {
      slug: "container",
      title: "容器技术",
      description: "Docker、Kubernetes 容器编排",
      order: 2,
      domainSlug: "infrastructure",
    },
    {
      slug: "network",
      title: "网络",
      description: "TCP/IP、HTTP/HTTPS、WebSocket 网络协议",
      order: 3,
      domainSlug: "infrastructure",
    },
    {
      slug: "monitoring",
      title: "监控与日志",
      description: "Prometheus、Grafana、ELK、链路追踪",
      order: 4,
      domainSlug: "infrastructure",
    },
  ],
  "frontend": [
    {
      slug: "html",
      title: "HTML",
      description: "HTML5 语义化标签、DOM 结构、表单与多媒体",
      order: 1,
      domainSlug: "frontend",
    },
    {
      slug: "css",
      title: "CSS",
      description: "CSS3 样式、布局、动画、响应式设计",
      order: 2,
      domainSlug: "frontend",
    },
    {
      slug: "typescript",
      title: "TypeScript",
      description: "TypeScript 类型系统、编译配置、高级特性",
      order: 3,
      domainSlug: "frontend",
    },
    {
      slug: "vue",
      title: "Vue",
      description: "Vue.js 框架、组件化、状态管理、工程化",
      order: 4,
      domainSlug: "frontend",
    },
  ],
};

// 分组配置：每个分类下的分组定义
export const groupsByCategory: Record<string, Group[]> = {
  // AI 领域
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
  "spec-coding": [
    { slug: "overview", title: "技术规范概述", categorySlug: "spec-coding", order: 1 },
  ],
  // Golang 领域
  "golang": [
    { slug: "overview", title: "Go语言概述", categorySlug: "golang", order: 1 },
    { slug: "basics", title: "基础语法", categorySlug: "golang", order: 2 },
    { slug: "data-types", title: "数据类型", categorySlug: "golang", order: 3 },
    { slug: "concurrency", title: "并发编程", categorySlug: "golang", order: 4 },
    { slug: "features", title: "语言特性", categorySlug: "golang", order: 5 },
    { slug: "keywords", title: "关键字", categorySlug: "golang", order: 6 },
    { slug: "frameworks", title: "框架与工具", categorySlug: "golang", order: 7 },
  ],
  // Java 领域
  "java": [
    { slug: "overview", title: "Java概述", categorySlug: "java", order: 1 },
    { slug: "basics", title: "Java基础", categorySlug: "java", order: 2 },
    { slug: "collections", title: "集合框架", categorySlug: "java", order: 3 },
    { slug: "concurrency", title: "并发编程", categorySlug: "java", order: 4 },
    { slug: "jvm", title: "JVM", categorySlug: "java", order: 5 },
    { slug: "spring", title: "Spring", categorySlug: "java", order: 6 },
    { slug: "mybatis", title: "MyBatis", categorySlug: "java", order: 7 },
  ],
  // Redis 领域
  "redis": [
    { slug: "overview", title: "Redis概述", categorySlug: "redis", order: 1 },
    { slug: "data-types", title: "数据类型", categorySlug: "redis", order: 2 },
    { slug: "persistence", title: "持久化", categorySlug: "redis", order: 3 },
    { slug: "cluster", title: "集群", categorySlug: "redis", order: 4 },
    { slug: "application", title: "应用", categorySlug: "redis", order: 5 },
  ],
  // MySQL 领域
  "mysql": [
    { slug: "overview", title: "MySQL概述", categorySlug: "mysql", order: 1 },
    { slug: "index", title: "索引", categorySlug: "mysql", order: 2 },
    { slug: "optimization", title: "优化", categorySlug: "mysql", order: 3 },
    { slug: "transaction", title: "事务", categorySlug: "mysql", order: 4 },
    { slug: "replication", title: "复制", categorySlug: "mysql", order: 5 },
    { slug: "sharding", title: "分库分表", categorySlug: "mysql", order: 6 },
  ],
  // Elasticsearch 领域
  "elasticsearch": [
    { slug: "overview", title: "ES概述", categorySlug: "elasticsearch", order: 1 },
    { slug: "search", title: "搜索", categorySlug: "elasticsearch", order: 2 },
    { slug: "aggregation", title: "聚合", categorySlug: "elasticsearch", order: 3 },
  ],
  // InfluxDB 领域
  "influxdb": [
    { slug: "overview", title: "InfluxDB概述", categorySlug: "influxdb", order: 1 },
    { slug: "basics", title: "基础概念", categorySlug: "influxdb", order: 2 },
    { slug: "line-protocol", title: "Line Protocol", categorySlug: "influxdb", order: 3 },
    { slug: "influxql", title: "InfluxQL", categorySlug: "influxdb", order: 4 },
    { slug: "flux", title: "Flux查询语言", categorySlug: "influxdb", order: 5 },
    { slug: "cluster", title: "集群与高可用", categorySlug: "influxdb", order: 6 },
    { slug: "application", title: "应用场景", categorySlug: "influxdb", order: 7 },
  ],
  // 微服务架构
  "microservices": [
    { slug: "overview", title: "微服务概述", categorySlug: "microservices", order: 1 },
    { slug: "spring-cloud", title: "Spring Cloud", categorySlug: "microservices", order: 2 },
    { slug: "service-mesh", title: "Service Mesh", categorySlug: "microservices", order: 3 },
  ],
  // 消息队列
  "message-queue": [
    { slug: "overview", title: "消息队列概述", categorySlug: "message-queue", order: 1 },
    { slug: "kafka", title: "Kafka", categorySlug: "message-queue", order: 2 },
    { slug: "rocketmq", title: "RocketMQ", categorySlug: "message-queue", order: 3 },
    { slug: "rabbitmq", title: "RabbitMQ", categorySlug: "message-queue", order: 4 },
  ],
  // 分布式理论
  "distributed-theory": [
    { slug: "overview", title: "分布式概述", categorySlug: "distributed-theory", order: 1 },
    { slug: "cap-base", title: "CAP与BASE", categorySlug: "distributed-theory", order: 2 },
    { slug: "consistency", title: "一致性算法", categorySlug: "distributed-theory", order: 3 },
    { slug: "transaction", title: "分布式事务", categorySlug: "distributed-theory", order: 4 },
  ],
  // 服务治理
  "service-governance": [
    { slug: "overview", title: "服务治理概述", categorySlug: "service-governance", order: 1 },
    { slug: "registration", title: "注册中心", categorySlug: "service-governance", order: 2 },
    { slug: "circuit-breaker", title: "熔断限流", categorySlug: "service-governance", order: 3 },
    { slug: "tracing", title: "链路追踪", categorySlug: "service-governance", order: 4 },
  ],
  // Linux
  "linux": [
    { slug: "overview", title: "Linux概述", categorySlug: "linux", order: 1 },
    { slug: "commands", title: "常用命令", categorySlug: "linux", order: 2 },
    { slug: "shell", title: "Shell脚本", categorySlug: "linux", order: 3 },
    { slug: "performance", title: "性能调优", categorySlug: "linux", order: 4 },
  ],
  // 容器技术
  "container": [
    { slug: "docker", title: "Docker", categorySlug: "container", order: 1 },
    { slug: "docker-compose", title: "Docker Compose", categorySlug: "container", order: 2 },
    { slug: "kubernetes", title: "Kubernetes", categorySlug: "container", order: 3 },
    { slug: "harbor", title: "Harbor", categorySlug: "container", order: 4 },
  ],
  // 网络
  "network": [
    { slug: "overview", title: "网络概述", categorySlug: "network", order: 1 },
    { slug: "tcp-ip", title: "TCP/IP", categorySlug: "network", order: 2 },
    { slug: "http", title: "HTTP/HTTPS", categorySlug: "network", order: 3 },
  ],
  // 监控与日志
  "monitoring": [
    { slug: "overview", title: "监控概述", categorySlug: "monitoring", order: 1 },
    { slug: "prometheus", title: "Prometheus", categorySlug: "monitoring", order: 2 },
    { slug: "grafana", title: "Grafana", categorySlug: "monitoring", order: 3 },
    { slug: "tracing", title: "链路追踪", categorySlug: "monitoring", order: 4 },
    { slug: "elk", title: "ELK", categorySlug: "monitoring", order: 5 },
  ],
  // HTML
  "html": [
    { slug: "overview", title: "HTML 概述", categorySlug: "html", order: 1 },
    { slug: "semantic", title: "语义化标签", categorySlug: "html", order: 2 },
    { slug: "forms", title: "表单与输入", categorySlug: "html", order: 3 },
    { slug: "multimedia", title: "多媒体元素", categorySlug: "html", order: 4 },
  ],
  // CSS
  "css": [
    { slug: "overview", title: "CSS 概述", categorySlug: "css", order: 1 },
    { slug: "layout", title: "布局技术", categorySlug: "css", order: 2 },
    { slug: "animation", title: "动画与过渡", categorySlug: "css", order: 3 },
    { slug: "responsive", title: "响应式设计", categorySlug: "css", order: 4 },
  ],
  // TypeScript
  "typescript": [
    { slug: "overview", title: "TypeScript 概述", categorySlug: "typescript", order: 1 },
    { slug: "types", title: "类型系统", categorySlug: "typescript", order: 2 },
    { slug: "advanced", title: "高级特性", categorySlug: "typescript", order: 3 },
    { slug: "config", title: "编译配置", categorySlug: "typescript", order: 4 },
  ],
  // Vue
  "vue": [
    { slug: "overview", title: "Vue 概述", categorySlug: "vue", order: 1 },
    { slug: "basics", title: "基础语法", categorySlug: "vue", order: 2 },
    { slug: "components", title: "组件化", categorySlug: "vue", order: 3 },
    { slug: "state", title: "状态管理", categorySlug: "vue", order: 4 },
    { slug: "engineering", title: "工程化", categorySlug: "vue", order: 5 },
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
