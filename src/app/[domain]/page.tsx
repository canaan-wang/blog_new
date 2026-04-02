import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import {
  getDomainWithCategories,
  getCategoryIntro,
  getArticlesByCategory,
} from "@/lib/content";
import { getMDXComponents } from "@/components/article/MDXComponents";
import { domains, getCategories, getGroups } from "@/lib/domains";
import CategoryContent from "./CategoryContent";

export async function generateStaticParams() {
  return domains.map((d) => ({ domain: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const data = await getDomainWithCategories(domain);
  if (!data) return {};
  return {
    title: data.title,
    description: data.description,
  };
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const data = await getDomainWithCategories(domain);
  if (!data) notFound();

  // 找到第一个分类
  const categories = getCategories(domain);
  if (categories.length > 0) {
    const firstCategory = categories[0];
    const articles = await getArticlesByCategory(domain, firstCategory.slug);
    
    // 按分组排序，overview 在最前面
    const groups = getGroups(firstCategory.slug);
    
    // 找到 overview 分组的文章
    const overviewGroup = groups.find(g => g.slug === "overview");
    if (overviewGroup) {
      const overviewArticles = articles.filter(a => a.group === "overview");
      if (overviewArticles.length > 0) {
        // 跳转到 overview 的第一篇文章
        redirect(`/${domain}/${overviewArticles[0].slug}`);
      }
    }
    
    // 如果没有 overview，跳转到该分类的第一篇文章
    if (articles.length > 0) {
      redirect(`/${domain}/${articles[0].slug}`);
    }
  }

  const components = getMDXComponents();

  // Pre-render all category intros
  const categoryIntros: Array<{
    slug: string;
    title: string;
    content: React.ReactNode;
  }> = [];

  for (const category of data.categories) {
    const intro = await getCategoryIntro(domain, category.slug);
    if (intro) {
      categoryIntros.push({
        slug: category.slug,
        title: intro.title,
        content: (
          <MDXRemote
            source={intro.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypePrettyCode,
                    {
                      theme: "monokai",
                      keepBackground: true,
                    },
                  ],
                ],
              },
            }}
          />
        ),
      });
    }
  }

  if (categoryIntros.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="mb-3 font-serif text-2xl font-bold text-foreground">
            {data.title}
          </h1>
          <p className="text-sm text-muted">{data.description}</p>
          <p className="mt-6 text-sm text-muted">
            ← 请从左侧选择分类和文章开始阅读
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="text-muted">加载中...</div></div>}>
      <CategoryContent
        categories={categoryIntros}
        defaultSlug={categoryIntros[0]?.slug || ""}
      />
    </Suspense>
  );
}
