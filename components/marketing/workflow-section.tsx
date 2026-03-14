const stages = [
  {
    number: "01",
    label: "Concept",
    title: "Define the opportunity",
    description:
      "Capture the product idea, target market, and technical requirements. Log the initial specification and kick off the program.",
    icon: "💡",
    color: "from-ink to-teal",
    lightColor: "bg-ink/5 text-ink border-ink/10",
  },
  {
    number: "02",
    label: "Design",
    title: "Architect the solution",
    description:
      "Develop schematics, define the initial BOM structure, and create CAD layouts. Upload design artifacts for team review.",
    icon: "✏️",
    color: "from-teal to-accentDark",
    lightColor: "bg-teal/10 text-teal border-teal/20",
  },
  {
    number: "03",
    label: "Prototype",
    title: "Build and iterate",
    description:
      "Assemble the first hardware prototype. Test component fit, electrical performance, and firmware integration.",
    icon: "🔧",
    color: "from-accentDark to-accent",
    lightColor: "bg-accent/10 text-accentDark border-accent/20",
  },
  {
    number: "04",
    label: "Testing",
    title: "Validate and qualify",
    description:
      "Run EMC, thermal, drop, and functional tests. Log quality findings and raise change requests for identified issues.",
    icon: "🧪",
    color: "from-ink to-accent",
    lightColor: "bg-ink/5 text-ink border-ink/10",
  },
  {
    number: "05",
    label: "Manufacturing",
    title: "Scale production",
    description:
      "Hand off finalized BOM to manufacturing partners. Manage supplier relationships and coordinate build readiness.",
    icon: "🏭",
    color: "from-teal to-ink",
    lightColor: "bg-teal/10 text-teal border-teal/20",
  },
  {
    number: "06",
    label: "Launch",
    title: "Ship with confidence",
    description:
      "Release the product with full documentation, approved change records, and a complete quality history in Industrium.",
    icon: "🚀",
    color: "from-teal-500 to-teal-600",
    lightColor: "bg-teal-50 text-teal-700 border-teal-200",
  },
];

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="scroll-mt-20 relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* Background accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">
            Product lifecycle
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
            How hardware products move from idea to market
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            Industrium tracks every stage with structured data — so nothing gets
            lost between design reviews, supplier negotiations, and test cycles.
          </p>
        </div>

        {/* ── Timeline connector ─────────────────────────────────────── */}
        <div className="relative mt-16">
          {/* Horizontal connector line (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[52px] hidden h-0.5 bg-gradient-to-r from-accent/30 via-teal/30 to-ink/20 lg:block"
          />

          {/* Stage grid */}
          <div className="grid gap-8 lg:grid-cols-6">
            {stages.map((stage, index) => (
              <div key={stage.label} className="group relative flex flex-col items-center text-center">
                {/* Icon circle */}
                <div
                  className={`relative z-10 mb-5 flex size-[104px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${stage.color} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                >
                  <span className="text-2xl">{stage.icon}</span>
                  <span className="mt-1 font-mono text-[10px] font-bold tracking-widest text-white/70">
                    {stage.number}
                  </span>
                </div>

                {/* Stage badge */}
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stage.lightColor}`}
                >
                  {stage.label}
                </span>

                {/* Stage content */}
                <h3 className="mt-3 text-sm font-semibold text-ink">
                  {stage.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-steel">
                  {stage.description}
                </p>

                {/* Arrow connector (mobile) */}
                {index < stages.length - 1 && (
                  <div className="mt-4 flex justify-center text-steel/40 lg:hidden">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom callout ────────────────────────────────────────── */}
        <div className="mt-16 rounded-3xl border border-teal/15 bg-[linear-gradient(135deg,rgba(13,133,120,0.08),rgba(239,177,38,0.12))] p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-ink">
            Each stage is a structured record in Industrium — with version history, BOM snapshots,
            documents, change requests, and quality findings attached.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {["Versioned products", "BOM snapshots", "ECN history", "Quality log", "Supplier data"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink/10 bg-panel px-3 py-1 text-xs font-medium text-teal"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
