import {
  Box,
  GitPullRequestArrow,
  Layers,
  ShieldCheck,
  Truck,
  FileStack,
} from "lucide-react";

const features = [
  {
    icon: Box,
    eyebrow: "Product Management",
    title: "Full lifecycle visibility from concept to sustaining",
    description:
      "Create products with structured metadata — SKU, category, lifecycle stage, and version history. Promote programs from concept through design, prototype, testing, manufacturing, and launch with a single status update.",
    bullets: [
      "Lifecycle stage management (Concept → Launch)",
      "Automatic version tracking with summaries",
      "User-scoped product portfolio",
    ],
    accent: "from-ink to-teal",
    lightBg: "bg-accent/10",
    border: "hover:border-teal/30",
  },
  {
    icon: Layers,
    eyebrow: "BOM Management",
    title: "Multi-level bill of materials built for hardware teams",
    description:
      "Define component hierarchies with parent-child relationships, supplier links, quantity tracking, and per-component cost data. Visualize the full tree structure at any version.",
    bullets: [
      "Recursive BOM tree (unlimited depth)",
      "Per-component supplier and cost tracking",
      "BOM versioned alongside product releases",
    ],
    accent: "from-teal to-ink",
    lightBg: "bg-teal/10",
    border: "hover:border-teal/30",
  },
  {
    icon: GitPullRequestArrow,
    eyebrow: "Change Workflow",
    title: "Structured engineering change control with approvals",
    description:
      "Raise engineering change requests, move them through a formal review chain, capture approvals with timestamps, and mark changes as implemented — all with a full audit record.",
    bullets: [
      "Submitted → In Review → Approved → Implemented",
      "Approval records with approver and timestamp",
      "Linked directly to products for traceability",
    ],
    accent: "from-ink to-accent",
    lightBg: "bg-ink/5",
    border: "hover:border-accent/30",
  },
  {
    icon: Truck,
    eyebrow: "Supplier Collaboration",
    title: "A vendor directory your sourcing team can rely on",
    description:
      "Maintain a database of approved suppliers with contact details, country, qualification status, and performance scores. Link components directly to their source suppliers in the BOM.",
    bullets: [
      "Preferred / Active / Onboarding / Inactive statuses",
      "Performance score tracking per vendor",
      "Supplier-to-component linkage in BOM",
    ],
    accent: "from-accentDark to-accent",
    lightBg: "bg-accent/10",
    border: "hover:border-accent/35",
  },
  {
    icon: FileStack,
    eyebrow: "Document Management",
    title: "Secure, versioned storage for every engineering artifact",
    description:
      "Upload CAD designs, specifications, test reports, compliance certificates, and assembly instructions. Files are stored privately in Supabase Storage with time-limited signed access URLs.",
    bullets: [
      "CAD, Spec, Test Report, Compliance, Assembly",
      "Document version auto-increments on re-upload",
      "Secure signed URLs for file download",
    ],
    accent: "from-teal to-accent",
    lightBg: "bg-teal/10",
    border: "hover:border-teal/30",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Quality Tracking",
    title: "Capture defects before they delay your build",
    description:
      "Log quality findings with severity levels, link them to the affected product, and track status through investigation and resolution. Keep quality data in the same system as the product record.",
    bullets: [
      "Severity: Low / Medium / High / Critical",
      "Status: Open → Investigating → Resolved → Closed",
      "Product-linked for full traceability",
    ],
    accent: "from-ink to-accent",
    lightBg: "bg-ink/5",
    border: "hover:border-ink/20",
  },
];

export function ValueSection() {
  return (
    <section
      id="platform"
      className="scroll-mt-20 bg-surface py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Section header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">
            Platform capabilities
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
            Everything your hardware team needs in one place
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            Industrium replaces the spreadsheets, email chains, and shared drives that slow
            hardware teams down — with structured, connected product data.
          </p>
        </div>

        {/* ── Feature grid ─────────────────────────────────────────── */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.eyebrow}
              className={`group relative rounded-3xl border border-ink/10 bg-panel p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 ${feature.border}`}
            >
              {/* Icon */}
              <div
                className={`mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}
              >
                <feature.icon className="size-5" />
              </div>

              {/* Eyebrow */}
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-teal">
                {feature.eyebrow}
              </p>

              {/* Title */}
              <h3 className="text-lg font-semibold leading-snug text-ink">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-6 text-steel">
                {feature.description}
              </p>

              {/* Bullets */}
              <ul className="mt-5 space-y-2">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-steel">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(13,133,120,0.06), transparent 60%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
