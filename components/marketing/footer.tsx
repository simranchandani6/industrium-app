import Link from "next/link";
import { Factory } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Product Management", href: "#platform" },
    { label: "BOM Management", href: "#platform" },
    { label: "Change Workflow", href: "#platform" },
    { label: "Supplier Collaboration", href: "#platform" },
    { label: "Quality Tracking", href: "#platform" },
    { label: "Document Storage", href: "#platform" },
  ],
  Workflow: [
    { label: "Concept", href: "#workflow" },
    { label: "Design", href: "#workflow" },
    { label: "Prototype", href: "#workflow" },
    { label: "Testing", href: "#workflow" },
    { label: "Manufacturing", href: "#workflow" },
    { label: "Launch", href: "#workflow" },
  ],
  "Example products": [
    { label: "AeroFrame Structural Bracket", href: "#products" },
    { label: "HydroValve Pro Series", href: "#products" },
    { label: "MediPump Infusion Module", href: "#products" },
  ],
  Account: [
    { label: "Sign in", href: "/login" },
    { label: "Create account", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        {/* ── Top row ────────────────────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/25 transition group-hover:shadow-accent/40">
                <Factory className="size-5 text-ink" />
              </div>
              <div>
                <span className="text-base font-semibold text-white">Industrium</span>
                <span className="ml-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  PLM
                </span>
              </div>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">
              A modern Product Lifecycle Management platform for hardware manufacturing
              teams across any industry — from concept to launch, in one place.
            </p>

            {/* Tech stack badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["Next.js", "Supabase", "TypeScript", "TailwindCSS"].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/45">
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/65 transition hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Industrium PLM. Built with Next.js and Supabase.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-xs text-white/45 transition hover:text-accent"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-ink transition hover:bg-accent/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
