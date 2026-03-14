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
      "Organization-scoped product portfolio",
    ],
    accent: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50",
    border: "hover:border-violet-300",
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
    accent: "from-purple-500 to-indigo-600",
    lightBg: "bg-purple-50",
    border: "hover:border-purple-300",
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
    accent: "from-indigo-500 to-violet-600",
    lightBg: "bg-indigo-50",
    border: "hover:border-indigo-300",
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
    accent: "from-fuchsia-500 to-purple-600",
    lightBg: "bg-fuchsia-50",
    border: "hover:border-fuchsia-300",
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
    accent: "from-violet-500 to-fuchsia-600",
    lightBg: "bg-violet-50",
    border: "hover:border-violet-300",
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
    accent: "from-purple-500 to-pink-600",
    lightBg: "bg-purple-50",
    border: "hover:border-purple-300",
  },
];

export function ValueSection() {
  return (
    <section
      id="platform"
      className="scroll-mt-20 bg-gray-50 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Section header ───────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Platform capabilities
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 lg:text-5xl">
            Everything your hardware team needs in one place
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Industrium replaces the spreadsheets, email chains, and shared drives that slow
            hardware teams down — with structured, connected product data.
          </p>
        </div>

        {/* ── Feature grid ─────────────────────────────────────────── */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.eyebrow}
              className={`group relative rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/8 ${feature.border}`}
            >
              {/* Icon */}
              <div
                className={`mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg`}
              >
                <feature.icon className="size-5" />
              </div>

              {/* Eyebrow */}
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-violet-600">
                {feature.eyebrow}
              </p>

              {/* Title */}
              <h3 className="text-lg font-semibold leading-snug text-gray-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>

              {/* Bullets */}
              <ul className="mt-5 space-y-2">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139,92,246,0.04), transparent 60%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
