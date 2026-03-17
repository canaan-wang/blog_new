import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 font-serif text-6xl font-bold text-accent">404</h1>
      <p className="mb-6 text-lg text-muted">页面未找到</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <Home size={16} />
        返回首页
      </Link>
    </div>
  );
}
