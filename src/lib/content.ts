import { cache } from "react";
import type {
  ArticleMeta,
  Article,
  SidebarData,
  DomainWithCategories,
} from "@/types";
import { domains, getCategories, getDomain } from "./domains";
import {
  getArticleBySlug as staticGetArticleBySlug,
  getArticlesByDomain as staticGetArticlesByDomain,
  getArticlesByCategory as staticGetArticlesByCategory,
  getSidebarData as staticGetSidebarData,
  getCategoryIntro as staticGetCategoryIntro,
  getDomainWithCategories as staticGetDomainWithCategories,
  getAllArticleSlugs as staticGetAllArticleSlugs,
} from "./static-content";

export const getAllDomains = cache(async () => {
  return domains;
});

export const getDomainWithCategories = cache(
  async (domainSlug: string): Promise<DomainWithCategories | null> => {
    return staticGetDomainWithCategories(domainSlug);
  }
);

export const getArticlesByDomain = cache(
  async (domainSlug: string): Promise<ArticleMeta[]> => {
    return staticGetArticlesByDomain(domainSlug);
  }
);

export const getArticlesByCategory = cache(
  async (
    domainSlug: string,
    categorySlug: string
  ): Promise<ArticleMeta[]> => {
    return staticGetArticlesByCategory(domainSlug, categorySlug);
  }
);

export const getArticleBySlug = cache(
  async (domainSlug: string, slug: string): Promise<Article | null> => {
    return staticGetArticleBySlug(domainSlug, slug);
  }
);

export const getSidebarData = cache(
  async (domainSlug: string): Promise<SidebarData | null> => {
    return staticGetSidebarData(domainSlug);
  }
);

export const getCategoryIntro = cache(
  async (
    domainSlug: string,
    categorySlug: string
  ): Promise<{ content: string; title: string; summary: string } | null> => {
    return staticGetCategoryIntro(domainSlug, categorySlug);
  }
);

export const getAllArticleSlugs = cache(async () => {
  return staticGetAllArticleSlugs();
});
