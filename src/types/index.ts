export interface Domain {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Category {
  slug: string;
  title: string;
  description: string;
  order: number;
  domainSlug: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  summary: string;
  tags: string[];
  category: string;
  domain: string;
  group: string;
  draft: boolean;
}

export interface Article extends ArticleMeta {
  content: string; // raw MDX source
}

export interface SidebarCategory extends Category {
  articles: ArticleMeta[];
  hasIntro: boolean;
}

export interface SidebarData {
  domain: Domain;
  categories: SidebarCategory[];
}

export interface DomainWithCategories extends Domain {
  categories: Category[];
}
