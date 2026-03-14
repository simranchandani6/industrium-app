import { ArrowRight } from "lucide-react";
import Link from "next/link";

const seededProducts = [
  {
    name: "AeroFrame Structural Bracket",
    sku: "AFB-1001",
    category: "Aerospace",
    stage: "Testing",
    version: "v1.3",
    stageColor: "bg-amber-100 text-amber-800 border-amber-200",
    description:
      "High-strength titanium structural bracket for airframe assembly. Currently in fatigue validation and load cycle testing per AS9100 requirements.",
    bomHighlights: ["Ti-6Al-4V Billet", "Fastener Kit", "Surface Treatment", "Inspection Report"],
    openChanges: 1,
    openIssues: 1,
    accentGradient: "from-accent/15 to-teal/5",
    borderHover: "hover:border-teal/30",
    iconBg: "from-ink to-teal",
    iconLetter: "A",
  },
  {
    name: "HydroValve Pro Series",
    sku: "HVP-2204",
    category: "Industrial",
    stage: "Prototype",
    version: "v0.9",
    stageColor: "bg-amber-100 text-amber-800 border-amber-200",
    description:
      "High-pressure hydraulic control valve for industrial automation systems. Rated to 350 bar with modular actuator design for OEM integration.",
    bomHighlights: ["Valve Body Assembly", "Actuator Seal Kit", "Pressure Sensor", "Control Interface Board"],
    openChanges: 1,
    openIssues: 1,
    accentGradient: "from-teal/12 to-ink/5",
    borderHover: "hover:border-teal/30",
    iconBg: "from-teal to-ink",
    iconLetter: "H",
  },
  {
    name: "MediPump Infusion Module",
    sku: "MPM-3050",
    category: "Medical Devices",
    stage: "Design",
    version: "v0.7",
    stageColor: "bg-amber-100 text-amber-800 border-amber-200",
    description:
      "Precision infusion pump module for ambulatory drug delivery. IEC 60601 compliant design under review. Mechanical packaging finalization in progress.",
    bomHighlights: ["Peristaltic Pump Assembly", "Flow Rate Sensor", "Drive Motor", "Housing Shell"],
    openChanges: 0,
    openIssues: 0,
    accentGradient: "from-accent/15 to-ink/5",
    borderHover: "hover:border-accent/35",
    iconBg: "from-accentDark to-accent",
    iconLetter: "M",
  },
];

const suppliers = [
  {
    name: "Alpha Components Ltd",
    country: "Singapore",
    status: "Preferred",
    score: "94.5",
    statusColor: "bg-teal-100 text-teal-800",
  },
  {
    name: "Global Battery Systems",
    country: "South Korea",
    status: "Active",
    score: "91.2",
    statusColor: "bg-blue-100 text-blue-800",
  },
  {
    name: "NanoSensors Inc",
    country: "Germany",
    status: "Preferred",
    score: "96.8",
    statusColor: "bg-teal-100 text-teal-800",
  },
];

export function ProductsSection() {
  return (
    <section
      id="products"
      className="scroll-mt-20 relative overflow-hidden bg-white py-24 lg:py-32"
    >
      {/* Subtle top border gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">
            Live example data
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
            Real hardware programs managed in Industrium
          </h2>
          <p className="mt-5 text-lg leading-8 text-steel">
            The platform ships with seeded data from three realistic hardware products — sign in
            and start exploring immediately.
          </p>
        </div>

        {/* ── Product cards ─────────────────────────────────────────── */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {seededProducts.map((product) => (
            <div
              key={product.sku}
              className={`group relative rounded-3xl border border-ink/10 bg-panel p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-ink/10 ${product.borderHover}`}
            >
              {/* Gradient background on hover */}
              <div
                className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${product.accentGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative">
                {/* Product icon + stage */}
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${product.iconBg} text-lg font-bold text-white shadow-md`}
                  >
                    {product.iconLetter}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${product.stageColor}`}
                  >
                    {product.stage}
                  </span>
                </div>

                {/* Name & SKU */}
                <h3 className="text-lg font-semibold leading-snug text-ink">
                  {product.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-steel/70">
                  {product.sku} · {product.category} · {product.version}
                </p>

                {/* Description */}
                <p className="mt-4 text-sm leading-6 text-steel">{product.description}</p>

                {/* BOM highlights */}
                <div className="mt-5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-steel/70">
                    BOM components
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.bomHighlights.map((comp) => (
                      <span
                        key={comp}
                        className="rounded-full border border-teal/10 bg-teal/10 px-2.5 py-1 text-[10px] font-medium text-teal"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-surface px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-steel/70">
                      Open changes
                    </p>
                    <p className="mt-1 text-xl font-semibold text-ink">
                      {product.openChanges}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-steel/70">
                      Quality issues
                    </p>
                    <p className="mt-1 text-xl font-semibold text-ink">
                      {product.openIssues}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Suppliers strip ───────────────────────────────────────── */}
        <div className="mt-14">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-steel/70">
            Seeded supplier directory
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {suppliers.map((supplier) => (
              <div
                key={supplier.name}
                className="group flex items-center justify-between rounded-2xl border border-ink/10 bg-panel p-5 shadow-sm transition hover:border-teal/20 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <p className="font-semibold text-ink">{supplier.name}</p>
                  <p className="mt-0.5 text-sm text-steel">{supplier.country}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${supplier.statusColor}`}>
                    {supplier.status}
                  </span>
                  <p className="font-mono text-xs font-semibold text-steel">
                    Score {supplier.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA link ─────────────────────────────────────────────── */}
        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-teal transition hover:text-ink"
          >
            Sign up and explore the full dataset
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
