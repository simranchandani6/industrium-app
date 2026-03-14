import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const highlights = [
  "Full product + BOM data management",
  "Structured change request workflow",
  "Supabase Auth — sign up in seconds",
  "Private document storage included",
  "Supplier directory with performance scores",
  "Quality issue tracking built in",
];

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 py-24 lg:py-32">
      {/* ── Decorative background ───────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {/* Glowing orbs */}
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top/bottom borders */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center lg:px-8">
        {/* ── Eyebrow ──────────────────────────────────────────────── */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
          🚀 Get started today - it&apos;s free
        </div>

        {/* ── Headline ─────────────────────────────────────────────── */}
        <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white lg:text-6xl">
          Ready to centralize your
          <br className="hidden lg:block" />
          product lifecycle data?
        </h2>

        {/* ── Sub-copy ──────────────────────────────────────────────── */}
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/80">
          Create an account in seconds. The platform comes pre-loaded with realistic
          hardware product data so you can explore immediately.
        </p>

        {/* ── Highlights ───────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:mx-auto lg:max-w-xl">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <CheckCircle className="size-4 shrink-0 text-violet-300" />
              <span className="text-sm text-white/85">{item}</span>
            </div>
          ))}
        </div>

        {/* ── CTAs ─────────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-violet-700 shadow-xl shadow-black/20 transition hover:bg-violet-50 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/25"
          >
            Create your free account
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:border-white/50 hover:scale-[1.02]"
          >
            Sign in to existing account
          </Link>
        </div>

        {/* ── Fine print ───────────────────────────────────────────── */}
        <p className="mt-8 text-xs text-white/45">
          No credit card required. Sign up with email and get instant access to the full platform.
        </p>
      </div>
    </section>
  );
}
