import Link from "next/link";
import { ArrowRight, Factory } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface pt-32 pb-24 lg:pt-44 lg:pb-32">
      {/* ── Gradient background ─────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Hero glow overlay */}
        <div className="marketing-hero-glow absolute inset-0" />

        {/* Animated blobs */}
        <div
          className="marketing-blob absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-accent/30 to-teal/12 blur-3xl"
        />
        <div
          className="marketing-blob-alt absolute -right-40 top-10 h-[460px] w-[460px] rounded-full bg-gradient-to-bl from-teal/25 to-accent/15 blur-3xl"
        />
        <div
          className="marketing-blob absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(22,32,42,0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Badge ───────────────────────────────────────────────── */}
        <div className="marketing-fade-up mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-panel px-4 py-1.5 text-xs font-semibold text-teal shadow-sm shadow-ink/5">
            <Factory className="size-3.5" />
            Built for hardware manufacturing teams
            <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          </div>
        </div>

        {/* ── Headline ────────────────────────────────────────────── */}
        <div className="marketing-fade-up text-center" style={{ animationDelay: "0.1s" }}>
          <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-[1.1] tracking-tight text-ink lg:text-[72px]">
            The product lifecycle platform for{" "}
            <span className="marketing-gradient-text">
              hardware&nbsp;innovation
            </span>
          </h1>
        </div>

        {/* ── Sub-headline ─────────────────────────────────────────── */}
        <div className="marketing-fade-up mt-7 text-center" style={{ animationDelay: "0.2s" }}>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-steel">
            Industrium unifies your product data, multi-level BOMs, engineering change
            control, supplier records, and quality findings — giving hardware teams a{" "}
            <span className="font-medium text-ink">
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
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ink/20 transition hover:scale-[1.03] hover:bg-ink/90 hover:shadow-xl hover:shadow-ink/30"
          >
            Start building
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-panel px-8 py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:border-teal/30 hover:bg-white hover:text-teal hover:scale-[1.01]"
          >
            Sign in to dashboard
          </Link>
        </div>

        {/* ── Social proof stats ───────────────────────────────────── */}
        <div
          className="marketing-fade-up mx-auto mt-16 max-w-3xl"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="grid grid-cols-1 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-panel/90 shadow-lg shadow-ink/10 backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
                  <p className="text-sm font-semibold text-ink">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-steel">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
