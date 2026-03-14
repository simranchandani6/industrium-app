import { KpiCard } from "@/components/dashboard/kpi-card";
import { Panel } from "@/components/dashboard/panel";
import { getSessionContext } from "@/lib/data/auth";
import { getReportsSnapshot } from "@/lib/data/reports";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const snapshot = await getReportsSnapshot(
    sessionContext.supabase,
    sessionContext.profile,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <KpiCard
          label="Tracked components"
          value={snapshot.totalComponents}
          detail="Live BOM component rows across active products."
        />
        <KpiCard
          label="Document records"
          value={snapshot.totalDocuments}
          detail="Stored engineering artifacts across CAD, specs, compliance, and instructions."
        />
        <KpiCard
          label="Average feedback"
          value={snapshot.averageFeedbackRating?.toFixed(1) ?? "n/a"}
          detail="Average customer sentiment score from the feedback register."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Lifecycle distribution" eyebrow="Portfolio status">
          <div className="space-y-3">
            {snapshot.lifecycleBreakdown.map((item) => (
              <div key={item.stage} className="flex items-center justify-between rounded-2xl bg-white p-4">
                <p className="font-medium capitalize text-ink">{item.stage.replaceAll("_", " ")}</p>
                <p className="text-sm text-steel">{item.count} products</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="BOM cost by product" eyebrow="Cost management">
          <div className="space-y-3">
            {snapshot.bomCostByProduct.map((item) => (
              <div key={item.productId} className="flex items-center justify-between rounded-2xl bg-white p-4">
                <p className="font-medium text-ink">{item.productName}</p>
                <p className="text-sm text-steel">{formatCurrency(item.totalCost)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Quality severity" eyebrow="Issue profile">
          <div className="space-y-3">
            {snapshot.qualitySeverityBreakdown.map((item) => (
              <div key={item.severity} className="flex items-center justify-between rounded-2xl bg-white p-4">
                <p className="font-medium capitalize text-ink">{item.severity}</p>
                <p className="text-sm text-steel">{item.count} issues</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Compliance status" eyebrow="Regulatory summary">
          <div className="space-y-3">
            {snapshot.complianceStatusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-2xl bg-white p-4">
                <p className="font-medium capitalize text-ink">{item.status.replaceAll("_", " ")}</p>
                <p className="text-sm text-steel">{item.count} records</p>
              </div>
            ))}
            {snapshot.complianceStatusBreakdown.length === 0 ? (
              <p className="text-sm text-steel">No compliance records available.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
