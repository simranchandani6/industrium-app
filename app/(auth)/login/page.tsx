import { redirect } from "next/navigation";
import { Factory, Layers, GitPullRequestArrow, ShieldCheck } from "lucide-react";

import { AuthForm } from "@/components/forms/auth-form";
import { getSessionContext } from "@/lib/data/auth";

const highlights = [
  {
    icon: Factory,
    title: "Product Portfolio",
    description: "Manage products across every lifecycle stage from concept to sustaining.",
  },
  {
    icon: Layers,
    title: "BOM Management",
    description: "Multi-level bill of materials with component, supplier, and cost tracking.",
  },
  {
    icon: GitPullRequestArrow,
    title: "Change Control",
    description: "Structured ECR workflows with formal approvals and full audit trails.",
  },
  {
    icon: ShieldCheck,
    title: "Quality & Compliance",
    description: "Track defects, compliance records, and supplier qualifications in one place.",
  },
];

export default async function LoginPage() {
  const sessionContext = await getSessionContext();

  if (sessionContext) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen">
      {/* ── Left panel: branding & features ───────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-ink px-12 py-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent p-2.5 text-ink">
              <Factory className="size-5" />
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">
              Industrium PLM
            </span>
          </div>

          <h1 className="mt-14 text-4xl font-semibold leading-[1.15] tracking-tight">
            One platform for your entire product lifecycle.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/65">
            From initial concept through design, testing, and manufacturing — Industrium keeps your product data structured, connected, and audit-ready. Works for any hardware industry.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <item.icon className="mb-3 size-5 text-accent" />
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-white/55">{item.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-white/30">
          Industrium · Built for hardware teams · All industries
        </p>
      </div>

      {/* ── Right panel: login form ────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="rounded-xl bg-ink p-2 text-accent">
              <Factory className="size-4" />
            </div>
            <span className="text-sm font-semibold text-ink">Industrium PLM</span>
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-teal">
            Secure access
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-ink">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-steel">
            Sign in to your workspace to continue.
          </p>
          <div className="mt-8">
            <AuthForm mode="login" />
          </div>
        </div>
      </div>
    </main>
  );
}
