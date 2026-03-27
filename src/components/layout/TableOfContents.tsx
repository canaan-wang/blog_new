"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract h2 and h3 headings from the article
    const articleHeadings = document.querySelectorAll("article h2, article h3");
    const headingData: Heading[] = [];

    articleHeadings.forEach((heading) => {
      const id = heading.id;
      const text = heading.textContent || "";
      const level = heading.tagName === "H2" ? 2 : 3;

      if (id) {
        headingData.push({ id, text, level });
      }
    });

    setHeadings(headingData);

    // IntersectionObserver to track active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      }
    );

    articleHeadings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 overflow-y-auto py-2 xl:block">
      <nav>
        <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
          目录
        </h3>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-bg-alt ${
                  heading.level === 3 ? "ml-3" : ""
                } ${
                  activeId === heading.id
                    ? "font-medium text-accent"
                    : "text-muted hover:text-foreground"
                }`}
                title={heading.text}
              >
                <span className="line-clamp-2">{heading.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
