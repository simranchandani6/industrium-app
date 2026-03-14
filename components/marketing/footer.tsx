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
    <footer className="border-t border-gray-200 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        {/* ── Top row ────────────────────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-500/30 transition group-hover:shadow-violet-500/50">
                <Factory className="size-5 text-white" />
              </div>
              <div>
                <span className="text-base font-semibold text-white">Industrium</span>
                <span className="ml-1.5 rounded-full bg-violet-900/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                  PLM
                </span>
              </div>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-gray-400">
              A modern Product Lifecycle Management platform for hardware manufacturing
              teams across any industry — from concept to launch, in one place.
            </p>

            {/* Tech stack badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["Next.js", "Supabase", "TypeScript", "TailwindCSS"].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-gray-800 bg-gray-900 px-2.5 py-1 text-[10px] font-medium text-gray-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition hover:text-violet-400"
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
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Industrium PLM. Built with Next.js and Supabase.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-xs text-gray-500 transition hover:text-violet-400"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-violet-700 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
