const stages = [
  {
    number: "01",
    label: "Concept",
    title: "Define the opportunity",
    description:
      "Capture the product idea, target market, and technical requirements. Log the initial specification and kick off the program.",
    icon: "💡",
    color: "from-violet-500 to-violet-600",
    lightColor: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    number: "02",
    label: "Design",
    title: "Architect the solution",
    description:
      "Develop schematics, define the initial BOM structure, and create CAD layouts. Upload design artifacts for team review.",
    icon: "✏️",
    color: "from-purple-500 to-purple-600",
    lightColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    number: "03",
    label: "Prototype",
    title: "Build and iterate",
    description:
      "Assemble the first hardware prototype. Test component fit, electrical performance, and firmware integration.",
    icon: "🔧",
    color: "from-fuchsia-500 to-fuchsia-600",
    lightColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  {
    number: "04",
    label: "Testing",
    title: "Validate and qualify",
    description:
      "Run EMC, thermal, drop, and functional tests. Log quality findings and raise change requests for identified issues.",
    icon: "🧪",
    color: "from-indigo-500 to-indigo-600",
    lightColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    number: "05",
    label: "Manufacturing",
    title: "Scale production",
    description:
      "Hand off finalized BOM to manufacturing partners. Manage supplier relationships and coordinate build readiness.",
    icon: "🏭",
    color: "from-blue-500 to-blue-600",
    lightColor: "bg-blue-50 text-blue-700 border-blue-200",
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
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Product lifecycle
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 lg:text-5xl">
            How hardware products move from idea to market
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            Industrium tracks every stage with structured data — so nothing gets
            lost between design reviews, supplier negotiations, and test cycles.
          </p>
        </div>

        {/* ── Timeline connector ─────────────────────────────────────── */}
        <div className="relative mt-16">
          {/* Horizontal connector line (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[52px] hidden h-0.5 bg-gradient-to-r from-violet-200 via-indigo-200 to-teal-200 lg:block"
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
                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                  {stage.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {stage.description}
                </p>

                {/* Arrow connector (mobile) */}
                {index < stages.length - 1 && (
                  <div className="mt-4 flex justify-center text-gray-300 lg:hidden">
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
        <div className="mt-16 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-violet-700">
            Each stage is a structured record in Industrium — with version history, BOM snapshots,
            documents, change requests, and quality findings attached.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {["Versioned products", "BOM snapshots", "ECN history", "Quality log", "Supplier data"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-700"
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
