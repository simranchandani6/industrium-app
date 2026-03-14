"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Factory, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#platform", label: "Platform" },
  { href: "#workflow", label: "Workflow" },
  { href: "#products", label: "Products" },
];

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-ink/10 bg-panel/95 shadow-sm shadow-ink/5 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-ink shadow-lg shadow-accent/25 transition group-hover:shadow-accent/40">
            <Factory className="size-5" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-ink">Industrium</span>
            <span className="ml-1.5 hidden rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal sm:inline">
              PLM
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-steel transition hover:text-teal after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent/10 hover:text-teal"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-ink/20 transition hover:bg-ink/90 hover:shadow-lg hover:shadow-ink/30 hover:scale-[1.02]"
          >
            Start building
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-ink/10 text-steel transition hover:bg-accent/10 hover:text-teal md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-ink/10 bg-panel/98 px-4 pb-5 pt-3 backdrop-blur-md md:hidden">
          <nav className="mb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-ink transition hover:bg-accent/10 hover:text-teal"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="rounded-full border border-ink/10 px-4 py-3 text-center text-sm font-medium text-ink transition hover:border-accent/40 hover:bg-accent/10"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-ink/20"
            >
              Start building
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
