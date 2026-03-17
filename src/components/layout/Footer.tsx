export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-3 text-xs text-muted">
        <span className="font-serif">&quot;代码如诗，架构如画&quot;</span>
        <span>&middot;</span>
        <span>&copy; {new Date().getFullYear()} Canaan</span>
      </div>
    </footer>
  );
}
