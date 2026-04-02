"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { ChevronRight, FileText, BookOpen, Menu, X } from "lucide-react";
import type { SidebarData, ArticleMeta } from "@/types";
import { getGroups, getGroupTitle } from "@/lib/domains";

interface SidebarProps {
  data: SidebarData;
}

function groupArticles(
  articles: ArticleMeta[],
  categorySlug: string
): { group: string; groupTitle: string; order: number; articles: ArticleMeta[] }[] {
  const groupConfigs = getGroups(categorySlug);
  const map = new Map<string, ArticleMeta[]>();
  
  for (const a of articles) {
    const g = a.group || "未分类";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(a);
  }
  
  return Array.from(map.entries())
    .map(([group, articles]) => {
      const config = groupConfigs.find(g => g.slug === group);
      return {
        group,
        groupTitle: config?.title || group,
        order: config?.order || 999,
        articles,
      };
    })
    .sort((a, b) => a.order - b.order);
}

function SidebarInner({ data }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const categoryFromUrl = searchParams.get("category");
  const categoryFromArticle = data.categories.find((cat) =>
    cat.articles.some((a) => pathname === `/${data.domain.slug}/${a.slug}`)
  )?.slug;

  const derivedCategory =
    categoryFromUrl || categoryFromArticle || data.categories[0]?.slug || "";

  const [userSelectedCategory, setUserSelectedCategory] = useState<
    string | null
  >(null);

  const activeCategory = useMemo(() => {
    if (categoryFromUrl) {
      return categoryFromUrl;
    }
    if (categoryFromArticle) {
      return categoryFromArticle;
    }
    return userSelectedCategory || derivedCategory;
  }, [categoryFromUrl, categoryFromArticle, derivedCategory, userSelectedCategory]);

  const activeCat = data.categories.find((c) => c.slug === activeCategory);
  const grouped = activeCat ? groupArticles(activeCat.articles, activeCategory) : [];

  // Check if current page is an article page (has slug in pathname)
  // Article path: /{domain}/{slug}, Domain page: /{domain}
  const pathSegments = pathname.split("/").filter(Boolean);
  const isArticlePage = pathSegments.length === 2;

  // The intro link points to the domain page
  const introHref = `/${data.domain.slug}`;
  const isIntroActive = pathname === introHref;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-accent p-3 text-white shadow-lg transition-colors hover:bg-accent-hover md:hidden"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-[280px] flex-col border-r border-border bg-sidebar-bg transition-transform md:sticky md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Tech category tags */}
        <div className="flex-none border-b border-border p-3">
          <div className="flex flex-wrap gap-1.5">
            {data.categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("category", cat.slug);
                  // If on article page, navigate to domain page with category param
                  // Otherwise stay on current page and update param
                  const targetPath = isArticlePage
                    ? `/${data.domain.slug}`
                    : pathname;
                  router.push(`${targetPath}?${params.toString()}`);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-tag-active-bg text-tag-active-text"
                    : "border border-border bg-card-bg text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: Intro link + Grouped article list */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* Intro entry */}
          {activeCat?.hasIntro && (
            <Link
              href={`/${data.domain.slug}?category=${activeCategory}`}
              onClick={() => setMobileOpen(false)}
              className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                isIntroActive && categoryFromUrl === activeCategory
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card-bg text-foreground hover:border-accent hover:text-accent"
              }`}
            >
              <BookOpen size={14} className="shrink-0" />
              <span>{activeCat.title} 概览</span>
            </Link>
          )}

          {/* Grouped articles */}
          {grouped.length > 0 ? (
            <nav>
              {grouped.map((g) => (
                <ArticleGroup
                  key={g.group}
                  groupName={g.group}
                  groupTitle={g.groupTitle}
                  articles={g.articles}
                  domainSlug={data.domain.slug}
                  currentPath={pathname}
                  onArticleClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
          ) : (
            !activeCat?.hasIntro && (
              <p className="py-4 text-center text-sm italic text-muted">
                暂无文章
              </p>
            )
          )}
        </div>
      </aside>
    </>
  );
}

function ArticleGroup({
  groupName,
  groupTitle,
  articles,
  domainSlug,
  currentPath,
  onArticleClick,
}: {
  groupName: string;
  groupTitle: string;
  articles: ArticleMeta[];
  domainSlug: string;
  currentPath: string;
  onArticleClick: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-bg-alt"
      >
        <ChevronRight
          size={12}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`}
        />
        <span>{groupTitle}</span>
        <span className="ml-auto text-[10px] font-normal text-muted">
          {articles.length}
        </span>
      </button>
      {open && (
        <ul className="ml-1.5 mt-0.5 border-l border-border pl-2">
          {articles.map((article) => {
            const href = `/${domainSlug}/${article.slug}`;
            const isActive = currentPath === href;
            return (
              <li key={article.slug}>
                <Link
                  href={href}
                  onClick={onArticleClick}
                  className={`mb-0.5 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-bg-alt font-medium text-accent"
                      : "text-muted hover:bg-bg-alt hover:text-foreground"
                  }`}
                >
                  <FileText size={13} className="shrink-0" />
                  <span className="line-clamp-1">{article.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Sidebar({ data }: SidebarProps) {
  return (
    <Suspense>
      <SidebarInner data={data} />
    </Suspense>
  );
}
