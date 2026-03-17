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

  const firstCategory = data.categories[0];
  const intro = firstCategory
    ? await getCategoryIntro(domain, firstCategory.slug)
    : null;

  const components = getMDXComponents();

  if (!intro) {
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
    <article className="max-w-3xl">
      <div className="prose prose-lg max-w-none">
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
      </div>
    </article>
  );
}
