"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronRight } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Section {
  h2: Heading;
  h3s: Heading[];
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Extract headings from DOM
  useEffect(() => {
    const extract = () => {
      const article = document.querySelector("article");
      if (!article) return;
      
      const elements = article.querySelectorAll("h2[id], h3[id]");
      const data: Heading[] = [];
      
      elements.forEach((el) => {
        const id = el.getAttribute("id");
        const text = el.textContent || "";
        const level = el.tagName === "H2" ? 2 : 3;
        if (id) {
          data.push({ id, text, level });
        }
      });
      
      if (data.length > 0 && headings.length === 0) {
        setHeadings(data);
        
        const toExpand = new Set<string>();
        let currentH2: string | null = null;
        let hasH3 = false;
        
        data.forEach((h) => {
          if (h.level === 2) {
            if (currentH2 && hasH3) {
              toExpand.add(currentH2);
            }
            currentH2 = h.id;
            hasH3 = false;
          } else if (h.level === 3 && currentH2) {
            hasH3 = true;
          }
        });
        if (currentH2 && hasH3) {
          toExpand.add(currentH2);
        }
        setExpanded(toExpand);
      }
    };

    extract();
    const t1 = setTimeout(extract, 500);
    const t2 = setTimeout(extract, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [headings.length]);

  // Scroll spy
  useEffect(() => {
    if (headings.length === 0) return;
    
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Sort by position to find the topmost visible heading
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      { 
        root: scrollContainer,
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0 
      }
    );

    const article = document.querySelector("article");
    if (article) {
      const h2h3 = article.querySelectorAll("h2[id], h3[id]");
      h2h3.forEach(el => observer.observe(el));
    }

    return () => observer.disconnect();
  }, [headings]);

  // Build sections
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const h of headings) {
    if (h.level === 2) {
      if (current) sections.push(current);
      current = { h2: h, h3s: [] };
    } else if (h.level === 3 && current) {
      current.h3s.push(h);
    }
  }
  if (current) sections.push(current);

  // Scroll to heading
  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`[TableOfContents] Target element with id "${id}" not found`);
      return;
    }

    // Try to find scroll container, fallback to window
    let scrollContainer = document.getElementById("main-scroll-container");
    
    if (!scrollContainer) {
      // Fallback to window scroll
      const offset = 100; // Offset for navbar
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth"
      });
      return;
    }
    
    // Calculate position relative to scroll container
    const containerRect = scrollContainer.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const relativeTop = elRect.top - containerRect.top + scrollContainer.scrollTop;
    const offset = 100; // Offset for navbar
    
    scrollContainer.scrollTo({
      top: Math.max(0, relativeTop - offset),
      behavior: "smooth"
    });
  }, []);

  // Toggle section
  const toggle = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 overflow-y-auto py-2 xl:block">
      <nav>
        <h3 className="mb-3 flex items-center gap-2 px-3 text-sm font-semibold text-foreground">
          <span className="h-4 w-0.5 rounded-full bg-accent" />
          目录
        </h3>
        
        {headings.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted">加载中...</div>
        ) : (
          <ul className="space-y-1">
            {sections.map(sec => {
              const hasKids = sec.h3s.length > 0;
              const isH2Active = activeId === sec.h2.id;
              const hasActiveH3 = sec.h3s.some(h => h.id === activeId);
              const isActive = isH2Active || hasActiveH3;
              const isExp = expanded.has(sec.h2.id) || hasActiveH3;
              
              return (
                <li key={sec.h2.id}>
                  {/* H2 */}
                  <div className={`flex items-center rounded-md ${isActive ? "bg-bg-alt/80" : ""}`}>
                    {hasKids && (
                      <button 
                        onClick={(e) => toggle(sec.h2.id, e)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded transition-transform ${isExp ? "rotate-90" : ""}`}
                      >
                        <ChevronRight size={14} className={isActive ? "text-accent" : "text-muted"} />
                      </button>
                    )}
                    {!hasKids && <span className="w-2" />}
                    
                    <a
                      href={`#${sec.h2.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(sec.h2.id);
                      }}
                      className={`flex-1 py-2 pr-2 text-left text-sm cursor-pointer ${
                        isH2Active ? "font-medium text-accent" : "text-foreground hover:text-accent"
                      }`}
                    >
                      <span className="line-clamp-2">{sec.h2.text}</span>
                    </a>
                  </div>
                  
                  {/* H3 children */}
                  {hasKids && isExp && (
                    <ul className="mt-1 space-y-0.5">
                      {sec.h3s.map(h3 => {
                        const isH3Active = activeId === h3.id;
                        return (
                          <li key={h3.id}>
                            <a
                              href={`#${h3.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                scrollTo(h3.id);
                              }}
                              className={`ml-5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs cursor-pointer ${
                                isH3Active 
                                  ? "font-medium text-accent" 
                                  : "text-muted hover:text-foreground"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                isH3Active ? "bg-accent" : "bg-border"
                              }`} />
                              <span className="line-clamp-2">{h3.text}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}
