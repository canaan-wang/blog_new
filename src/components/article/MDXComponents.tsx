import type { MDXComponents } from "mdx/types";

export function getMDXComponents(): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mb-4 mt-8 font-serif text-3xl font-bold text-foreground">
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2 id={id} className="mb-3 mt-8 border-b border-border pb-2 font-serif text-2xl font-bold text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="mb-2 mt-6 font-serif text-xl font-bold text-foreground">
        {children}
      </h3>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-link underline decoration-link/30 underline-offset-2 transition-colors hover:text-link-hover hover:decoration-link-hover/50"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-accent pl-4 italic text-muted">
        {children}
      </blockquote>
    ),
    pre: ({ children }) => (
      <pre className="my-4 overflow-x-auto rounded-lg bg-[#2d2a2e] p-4 text-sm leading-relaxed">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="my-3 ml-6 list-disc space-y-1 text-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-3 ml-6 list-decimal space-y-1 text-foreground">
        {children}
      </ol>
    ),
    hr: () => <hr className="my-8 border-border" />,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-border bg-bg-alt px-3 py-2 text-left font-medium text-foreground">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-3 py-2 text-foreground">
        {children}
      </td>
    ),
  };
}
