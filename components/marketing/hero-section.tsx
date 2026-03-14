import Link from "next/link";
import { ArrowRight, Factory } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-24 lg:pt-44 lg:pb-32">
      {/* ── Gradient background ─────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Hero glow overlay */}
        <div className="marketing-hero-glow absolute inset-0" />

        {/* Animated blobs */}
        <div
          className="marketing-blob absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-violet-300/40 to-purple-400/20 blur-3xl"
        />
        <div
          className="marketing-blob-alt absolute -right-40 top-10 h-[460px] w-[460px] rounded-full bg-gradient-to-bl from-indigo-300/35 to-violet-400/20 blur-3xl"
        />
        <div
          className="marketing-blob absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-300/25 blur-3xl"
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #7c3aed 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Badge ───────────────────────────────────────────────── */}
        <div className="marketing-fade-up mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-sm shadow-violet-500/10">
            <Factory className="size-3.5" />
            Built for hardware manufacturing teams
            <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
          </div>
        </div>

        {/* ── Headline ────────────────────────────────────────────── */}
        <div className="marketing-fade-up text-center" style={{ animationDelay: "0.1s" }}>
          <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-[1.1] tracking-tight text-gray-900 lg:text-[72px]">
            The product lifecycle platform for{" "}
            <span className="marketing-gradient-text">
              hardware&nbsp;innovation
            </span>
          </h1>
        </div>

        {/* ── Sub-headline ─────────────────────────────────────────── */}
        <div className="marketing-fade-up mt-7 text-center" style={{ animationDelay: "0.2s" }}>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600">
            Industrium unifies your product data, multi-level BOMs, engineering change
            control, supplier records, and quality findings — giving hardware teams a{" "}
            <span className="font-medium text-gray-800">
              single source of truth from concept to launch.
            </span>
          </p>
        </div>

        {/* ── CTAs ────────────────────────────────────────────────── */}
        <div
          className="marketing-fade-up mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:from-violet-700 hover:to-purple-700 hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/40"
          >
            Start building
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:scale-[1.01]"
          >
            Sign in to dashboard
          </Link>
        </div>

        {/* ── Social proof stats ───────────────────────────────────── */}
        <div
          className="marketing-fade-up mx-auto mt-16 max-w-3xl"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="grid grid-cols-1 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white/80 shadow-lg shadow-gray-200/60 backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              {
                icon: "⚙️",
                value: "Multi-level BOM",
                label: "Hierarchical component structures",
              },
              {
                icon: "🔄",
                value: "Change workflow",
                label: "Submit → Review → Approve → Implement",
              },
              {
                icon: "🔒",
                value: "Secure storage",
                label: "CAD, specs and compliance docs",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-start gap-3 px-7 py-5">
                <span className="mt-0.5 text-xl">{stat.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
