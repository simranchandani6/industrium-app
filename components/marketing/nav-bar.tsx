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
          ? "border-b border-violet-100/60 bg-white/95 shadow-sm shadow-violet-500/5 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/30 transition group-hover:shadow-violet-500/50">
            <Factory className="size-5" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">Industrium</span>
            <span className="ml-1.5 hidden rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 sm:inline">
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
              className="relative text-sm font-medium text-gray-600 transition hover:text-violet-700 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-violet-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-700 hover:to-purple-700 hover:shadow-lg hover:shadow-violet-500/35 hover:scale-[1.02]"
          >
            Start building →
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-violet-50 hover:text-violet-700 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white/98 backdrop-blur-md px-4 pb-5 pt-3 md:hidden">
          <nav className="mb-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-violet-50 hover:text-violet-700"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="rounded-full border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-violet-300 hover:bg-violet-50"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md shadow-violet-500/25"
            >
              Start building →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
