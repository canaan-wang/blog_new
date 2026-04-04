"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface ArticleContentProps {
  html: string;
}

export default function ArticleContent({ html }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化 mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "inherit",
    });

    // 找到所有 mermaid 代码块
    const mermaidBlocks = containerRef.current.querySelectorAll(
      'pre code.language-mermaid, pre code[data-language="mermaid"]'
    );

    mermaidBlocks.forEach((block, index) => {
      const pre = block.closest("pre");
      if (!pre) return;

      const chart = block.textContent || "";
      const id = `mermaid-chart-${index}`;

      // 创建图表容器
      const chartDiv = document.createElement("div");
      chartDiv.id = id;
      chartDiv.className = "my-6 overflow-x-auto rounded-lg border border-border bg-white p-4";

      // 隐藏原始代码块
      pre.style.display = "none";
      pre.parentNode?.insertBefore(chartDiv, pre.nextSibling);

      // 渲染图表
      mermaid
        .render(`${id}-svg`, chart)
        .then(({ svg }) => {
          chartDiv.innerHTML = svg;
        })
        .catch((err) => {
          console.error("Mermaid render error:", err);
          chartDiv.innerHTML = `<div class="text-red-500 text-sm p-4">图表渲染失败</div>`;
        });
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="prose prose-lg max-w-none article-html-content"
      style={{
        ['--tw-prose-pre-bg' as string]: '#faf7f2',
        ['--tw-prose-pre-code' as string]: '#2c2c2c',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
