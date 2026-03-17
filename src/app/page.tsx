import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* Welcome badge */}
        <div className="mb-5 inline-block rounded-full border border-border bg-bg-alt px-4 py-1.5 text-sm text-muted">
          Welcome to my blog
        </div>

        {/* Name */}
        <h1 className="mb-3 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {siteConfig.author}
        </h1>

        {/* Motto */}
        <p className="mb-6 font-serif text-lg italic text-muted">
          &ldquo;{siteConfig.motto}&rdquo;
        </p>

        {/* Personal Intro */}
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted">
          后端开发者，专注于分布式系统设计、数据治理与软件架构。
          <br />
          热爱用代码解决复杂问题，在这里记录我的技术探索与项目实践。
        </p>

        {/* Tech Stack Tags - 3 rows: short / medium / short */}
        <div className="flex flex-col items-center gap-2">
          {siteConfig.techStackRows.map((row, i) => (
            <div key={i} className="flex flex-wrap justify-center gap-2">
              {row.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-card-bg px-3.5 py-1 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {tech}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
