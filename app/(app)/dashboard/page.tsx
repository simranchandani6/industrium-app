import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Boxes,
  Bug,
  ClipboardList,
  Factory,
  FileArchive,
  ShieldAlert,
} from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Panel } from "@/components/dashboard/panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getSessionContext } from "@/lib/data/auth";
import { getDashboardSnapshot } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const snapshot = await getDashboardSnapshot(sessionContext.supabase, sessionContext.profile);
  const focus = sessionContext.dashboardFocus;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 rounded-[30px] bg-ink px-6 py-8 text-white lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/60">
            {focus.title}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Monitor hardware programs from component structure to launch readiness.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/72">
            {focus.description}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/65">Current operator</p>
          <p className="mt-3 text-2xl font-semibold">{sessionContext.profile.full_name}</p>
          <p className="mt-2 text-sm text-white/65">Logged in as: {sessionContext.roleLabel}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {focus.highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-ink transition hover:bg-[#f3be46]"
            >
              Open products
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <KpiCard
          label="Active products"
          value={snapshot.productCount}
          detail="Products currently tracked across design, validation, and launch phases."
        />
        <KpiCard
          label="Open quality issues"
          value={snapshot.openQualityIssueCount}
          detail="Issues still open or under investigation across active programs."
        />
        <KpiCard
          label="Pending change requests"
          value={snapshot.pendingChangeRequestCount}
          detail="Engineering changes awaiting review or formal approval."
        />
        <KpiCard
          label="Approved suppliers"
          value={snapshot.supplierCount}
          detail="Suppliers cataloged with contact details and performance tracking."
        />
        <KpiCard
          label="Open risks"
          value={snapshot.openRiskCount}
          detail="Program risks that still require mitigation or monitoring."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Product portfolio" eyebrow="Live programs">
          <div className="space-y-4">
            {snapshot.products.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-ink/20 bg-surface p-10 text-center">
                <p className="text-lg font-semibold text-ink">No products yet</p>
                <p className="mt-2 text-sm text-steel">
                  Create your first product to start managing your hardware lifecycle.
                </p>
                <Link
                  href="/dashboard/products"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink/90"
                >
                  Create your first product
                </Link>
              </div>
            ) : null}
            {snapshot.products.map((product) => (
              <div
                key={product.id}
                className="rounded-[24px] border border-ink/10 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">{product.product_name}</p>
                    <p className="mt-1 text-sm text-steel">
                      {product.product_sku} • {product.product_category}
                    </p>
                  </div>
                  <StatusBadge value={product.lifecycle_stage} />
                </div>
                <p className="mt-4 text-sm leading-6 text-steel">{product.description}</p>
                <div className="mt-4 grid gap-3 text-sm text-steel md:grid-cols-4">
                  <div className="rounded-2xl bg-surface px-4 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em]">Version</p>
                    <p className="mt-2 text-base font-medium text-ink">
                      {product.currentVersion?.version_code ?? "Unreleased"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface px-4 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em]">BOM items</p>
                    <p className="mt-2 text-base font-medium text-ink">{product.componentCount}</p>
                  </div>
                  <div className="rounded-2xl bg-surface px-4 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em]">Changes</p>
                    <p className="mt-2 text-base font-medium text-ink">
                      {product.openChangeRequestCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface px-4 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em]">Quality</p>
                    <p className="mt-2 text-base font-medium text-ink">
                      {product.openQualityIssueCount}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-teal"
                >
                  Open product detail
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Upcoming project milestones" eyebrow="Schedule">
            <div className="space-y-4">
              {snapshot.upcomingProjects.map((project) => (
                <div key={project.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{project.project_name}</p>
                      <p className="mt-1 text-sm text-steel">{formatDate(project.deadline)}</p>
                    </div>
                    <StatusBadge value={project.status} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Recent activity" eyebrow="Attention areas">
            <div className="space-y-3">
              {snapshot.recentChangeRequests.map((changeRequest) => (
                <div key={changeRequest.id} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                  <ClipboardList className="mt-1 size-4 text-accentDark" />
                  <div>
                    <p className="font-medium text-ink">{changeRequest.title}</p>
                    <p className="mt-1 text-sm text-steel">Change control</p>
                  </div>
                </div>
              ))}
              {snapshot.recentQualityIssues.map((qualityIssue) => (
                <div key={qualityIssue.id} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                  <Bug className="mt-1 size-4 text-signal" />
                  <div>
                    <p className="font-medium text-ink">{qualityIssue.issue_title}</p>
                    <p className="mt-1 text-sm text-steel">Quality investigation</p>
                  </div>
                </div>
              ))}
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { icon: Factory, label: "Manufacturing view" },
                  { icon: Boxes, label: "BOM visibility" },
                  { icon: FileArchive, label: "Document history" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-ink/10 bg-surface px-4 py-5 text-center"
                  >
                    <item.icon className="mx-auto size-5 text-teal" />
                    <p className="mt-3 text-sm font-medium text-ink">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel
            title="Notifications"
            eyebrow="Operational alerts"
            actions={
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-steel">
                {snapshot.unreadNotificationCount} unread
              </span>
            }
          >
            <div className="space-y-3">
              {snapshot.recentNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                  {notification.level === "warning" ? (
                    <ShieldAlert className="mt-1 size-4 text-signal" />
                  ) : (
                    <BellRing className="mt-1 size-4 text-teal" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{notification.title}</p>
                    <p className="mt-1 text-sm leading-6 text-steel">{notification.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-steel">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              {snapshot.recentNotifications.length === 0 ? (
                <p className="text-sm text-steel">No alerts yet.</p>
              ) : null}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
