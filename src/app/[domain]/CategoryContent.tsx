"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

interface Category {
  slug: string;
  title: string;
  content: ReactNode;
}

interface CategoryContentProps {
  categories: Category[];
  defaultSlug: string;
}

export default function CategoryContent({
  categories,
  defaultSlug,
}: CategoryContentProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // Find the active category
  const activeCategory =
    categories.find((c) => c.slug === categoryParam) ||
    categories.find((c) => c.slug === defaultSlug) ||
    categories[0];

  if (!activeCategory) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted">暂无内容</div>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full">
      <div className="prose prose-lg max-w-none">{activeCategory.content}</div>
    </article>
  );
}
