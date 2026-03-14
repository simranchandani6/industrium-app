import { AccessNotice } from "@/components/dashboard/access-notice";
import { Panel } from "@/components/dashboard/panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { QualityIssueForm } from "@/components/forms/quality-issue-form";
import { getSessionContext } from "@/lib/data/auth";
import { getProducts } from "@/lib/data/products";
import { getQualityIssues } from "@/lib/data/quality";
import { hasCapability } from "@/lib/rbac";

export default async function QualityPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const [products, qualityIssues] = await Promise.all([
    getProducts(sessionContext.supabase, sessionContext.profile),
    getQualityIssues(sessionContext.supabase, sessionContext.profile),
  ]);
  const canManageQuality = hasCapability(sessionContext.role, "manage_quality");

  return (
    <div className="space-y-6">
      <Panel title="Quality issue tracking" eyebrow="Validation and corrective actions">
        {canManageQuality ? (
          <QualityIssueForm products={products} />
        ) : (
          <AccessNotice
            title="Read-only for your role"
            body="Only the Quality Engineer can log new issues in this MVP. You can still review the shared issue board below."
            detail={sessionContext.roleLabel}
          />
        )}
      </Panel>

      <Panel title="Issue board" eyebrow="Open and resolved findings">
        <div className="space-y-4">
          {qualityIssues.map((qualityIssue) => {
            const product = products.find((item) => item.id === qualityIssue.product_id);

            return (
              <div key={qualityIssue.id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">{qualityIssue.issue_title}</p>
                    <p className="mt-1 text-sm text-steel">{product?.product_name ?? "Product unavailable"}</p>
                  </div>
                  <div className="space-x-2">
                    <StatusBadge value={qualityIssue.severity} />
                    <StatusBadge value={qualityIssue.status} />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-steel">{qualityIssue.description}</p>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
