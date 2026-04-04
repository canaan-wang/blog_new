import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { getArticleBySlug, getAllArticleSlugs } from "@/lib/content";
import ArticleContent from "@/components/article/ArticleContent";

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const article = await getArticleBySlug(domain, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const article = await getArticleBySlug(domain, slug);
  if (!article) notFound();

  return (
    <article className="mx-auto w-full">
      {/* Article Content with Mermaid Support */}
      <ArticleContent html={article.content} />
    </article>
  );
}
