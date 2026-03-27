import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import {
  getDomainWithCategories,
  getCategoryIntro,
} from "@/lib/content";
import { getMDXComponents } from "@/components/article/MDXComponents";
import { domains } from "@/lib/domains";
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
