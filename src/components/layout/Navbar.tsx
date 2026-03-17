"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Domain } from "@/types";

interface NavbarProps {
  domains: Domain[];
}

export default function Navbar({ domains }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-nav-bg backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="font-serif text-xl font-bold tracking-wide text-foreground transition-colors hover:text-accent"
        >
          Canaan
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {domains.map((domain) => (
            <Link
              key={domain.slug}
              href={`/${domain.slug}`}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-alt hover:text-accent ${
                pathname.startsWith(`/${domain.slug}`)
                  ? "text-accent"
                  : "text-foreground"
              }`}
            >
              {domain.title}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-bg-alt md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-border bg-card-bg px-4 py-3 md:hidden">
          {domains.map((domain) => (
            <Link
              key={domain.slug}
              href={`/${domain.slug}`}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-bg-alt ${
                pathname.startsWith(`/${domain.slug}`)
                  ? "text-accent"
                  : "text-foreground"
              }`}
            >
              {domain.title}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
