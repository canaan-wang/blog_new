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
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="mb-4 font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
          {article.title}
        </h1>
        <p className="mb-4 text-base text-muted">{article.summary}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {article.date}
          </span>
          {article.updated && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              更新于 {article.updated}
            </span>
          )}
        </div>
      </header>

      {/* Article Content with Mermaid Support */}
      <ArticleContent html={article.content} />
    </article>
  );
}
