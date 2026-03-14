import { LayoutGrid, ShieldCheck, ChevronRight } from "lucide-react";

const kpiCards = [
  { label: "Active products", value: "3", change: "+1 this month" },
  { label: "Open quality issues", value: "2", change: "High priority" },
  { label: "Pending changes", value: "2", change: "Awaiting approval" },
  { label: "Approved suppliers", value: "3", change: "Preferred: 2" },
];

const products = [
  {
    name: "AeroFrame Structural Bracket",
    sku: "AFB-1001",
    category: "Aerospace",
    stage: "testing",
    version: "v1.3",
    components: 6,
    stageColor: "bg-amber-100 text-amber-800",
  },
  {
    name: "HydroValve Pro Series",
    sku: "HVP-2204",
    category: "Industrial",
    stage: "prototype",
    version: "v0.9",
    components: 5,
    stageColor: "bg-amber-100 text-amber-800",
  },
  {
    name: "MediPump Infusion Module",
    sku: "MPM-3050",
    category: "Medical Devices",
    stage: "design",
    version: "v0.7",
    components: 4,
    stageColor: "bg-amber-100 text-amber-800",
  },
];

const bomRows = [
  { indent: 0, name: "Valve Body Assembly", sku: "CMP-VBA-03", type: "module", qty: 1, cost: "$84.90" },
  { indent: 1, name: "Stainless Steel Housing", sku: "CMP-SSH-04", type: "mechanical", qty: 1, cost: "$32.50" },
  { indent: 1, name: "Actuator Seal Kit", sku: "CMP-ASK-05", type: "mechanical", qty: 2, cost: "$8.20" },
  { indent: 0, name: "Control Interface Board", sku: "CMP-CIB-01", type: "module", qty: 1, cost: "$46.75" },
  { indent: 0, name: "Pressure Sensor", sku: "CMP-PSR-02", type: "sensor", qty: 1, cost: "$22.40" },
];

const qualityIssues = [
  { title: "Seal leak detected at 200 bar pressure cycle", product: "HydroValve Pro Series", severity: "high", status: "investigating" },
  { title: "Flow rate deviation at low temperature range", product: "HydroValve Pro Series", severity: "medium", status: "open" },
];

const sidebarItems = [
  { label: "Overview", active: false },
  { label: "Products", active: true },
  { label: "Documents", active: false },
  { label: "Change Control", active: false },
  { label: "Suppliers", active: false },
  { label: "Quality", active: false },
];

export function DashboardPreview() {
  return (
    <section className="bg-gray-50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* ── Section header ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Platform preview
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 lg:text-5xl">
            Your entire product portfolio, at a glance
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            A unified dashboard surfaces KPIs, product health, BOM structures, and quality
            findings — so your team always knows where each program stands.
          </p>
        </div>

        {/* ── Three preview cards ─────────────────────────────────────── */}
        <div className="mt-16 grid gap-5 lg:grid-cols-[1.4fr_0.6fr] xl:grid-cols-[1.5fr_0.5fr]">

          {/* Left: Main dashboard mock */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400/90" />
                <div className="size-2.5 rounded-full bg-yellow-400/90" />
                <div className="size-2.5 rounded-full bg-green-400/90" />
              </div>
              <div className="flex flex-1 justify-center">
                <div className="rounded-md border border-gray-200 bg-white px-4 py-1 font-mono text-[11px] text-gray-400">
                  app.industrium.io/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard layout */}
            <div className="flex" style={{ minHeight: 520 }}>
              {/* Sidebar */}
              <aside className="hidden w-52 shrink-0 flex-col border-r border-gray-100 bg-gray-900 p-4 xl:flex">
                {/* Logo */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-violet-600">
                    <LayoutGrid className="size-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white">Industrium PLM</span>
                </div>

                {/* User info */}
                <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] text-white/50">Industrium PLM</p>
                  <p className="mt-1 text-xs font-semibold text-white">Marcus Chen</p>
                  <p className="mt-0.5 text-[10px] capitalize text-white/55">Hardware Engineer</p>
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                        item.active
                          ? "bg-white font-medium text-gray-900"
                          : "text-white/65"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.active && <ShieldCheck className="size-3.5 text-violet-600" />}
                    </div>
                  ))}
                </nav>
              </aside>

              {/* Main content */}
              <div className="flex-1 overflow-hidden bg-[#f6f3ec] p-5">
                {/* KPI row */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {kpiCards.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
                    >
                      <p className="text-[10px] font-medium text-gray-500">{kpi.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">{kpi.value}</p>
                      <p className="mt-1 text-[10px] text-gray-400">{kpi.change}</p>
                    </div>
                  ))}
                </div>

                {/* Products table */}
                <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-semibold text-gray-800">Product portfolio</p>
                  <div className="space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.sku}
                        className="flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50 px-3 py-2.5"
                      >
                        <div>
                          <p className="text-xs font-medium text-gray-900">{product.name}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                            {product.sku} · {product.version} · {product.components} parts
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${product.stageColor}`}
                        >
                          {product.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* BOM Tree card */}
            <div className="flex-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
              <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">BOM visualization</p>
                <p className="font-mono text-[10px] text-gray-400">HydroValve Pro · BOM-v0.9</p>
              </div>
              <div className="p-4 space-y-1.5">
                {bomRows.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2"
                    style={{ marginLeft: row.indent * 14 }}
                  >
                    {row.indent > 0 && (
                      <ChevronRight className="size-3 shrink-0 text-gray-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[10px] font-medium text-gray-900">{row.name}</p>
                      <p className="font-mono text-[9px] text-gray-400">{row.sku}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-medium text-gray-700">{row.cost}</p>
                      <span className="inline-block rounded-full bg-violet-100 px-1.5 py-0.5 text-[8px] font-medium text-violet-700">
                        {row.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality issues card */}
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
              <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">Quality issues</p>
                <p className="text-[10px] text-gray-400">Open and under investigation</p>
              </div>
              <div className="p-4 space-y-2">
                {qualityIssues.map((issue, i) => (
                  <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] font-medium leading-snug text-gray-900">
                        {issue.title}
                      </p>
                      <div className="flex shrink-0 flex-col gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase ${
                            issue.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[8px] font-semibold uppercase text-orange-600">
                          {issue.status}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[9px] text-gray-400">{issue.product}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
