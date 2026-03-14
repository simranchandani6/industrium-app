import { redirect } from "next/navigation";
import { Factory, CheckCircle2 } from "lucide-react";

import { AuthForm } from "@/components/forms/auth-form";
import { getSessionContext } from "@/lib/data/auth";

const benefits = [
  "Manage products across any industry — automotive, aerospace, medical, and more",
  "Structure multi-level BOMs with supplier and cost data",
  "Run formal engineering change workflows with approval trails",
  "Upload and version CAD files, specs, and compliance documents",
  "Track quality findings and supplier qualifications in one place",
  "Your data stays private and isolated to your account",
];

const industries = ["Automotive", "Aerospace", "Medical Devices", "Industrial", "Consumer Hardware", "Defense"];

export default async function RegisterPage() {
  const sessionContext = await getSessionContext();

  if (sessionContext) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen">
      {/* ── Left panel: register form ─────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <div className="rounded-xl bg-ink p-2 text-accent">
              <Factory className="size-4" />
            </div>
            <span className="text-sm font-semibold text-ink">Industrium PLM</span>
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-teal">
            Get started free
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-steel">
            Set up your workspace in seconds. No credit card required.
          </p>
          <div className="mt-8">
            <AuthForm mode="register" />
          </div>
        </div>
      </div>

      {/* ── Right panel: value proposition ───────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-ink px-12 py-12 text-white">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
            What you get
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.15] tracking-tight">
            A PLM built for the way hardware teams actually work.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/65">
            Industrium is not locked to one industry. Whether you make automotive parts, medical devices, or industrial equipment — the same structured platform works for your team.
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                <span className="text-sm leading-6 text-white/75">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            Trusted across industries
          </p>
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/65"
              >
                {industry}
              </span>
            ))}
          </div>
          <p className="mt-8 text-xs text-white/30">
            Industrium · Built for hardware teams · All industries
          </p>
        </div>
      </div>
    </main>
  );
}
