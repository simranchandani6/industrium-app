import { Panel } from "@/components/dashboard/panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ChangeRequestForm } from "@/components/forms/change-request-form";
import { ChangeRequestStatusForm } from "@/components/forms/change-request-status-form";
import { getSessionContext } from "@/lib/data/auth";
import { getChangeRequests } from "@/lib/data/change-requests";
import { getProducts } from "@/lib/data/products";

export default async function ChangesPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const [products, workflow] = await Promise.all([
    getProducts(sessionContext.supabase, sessionContext.profile),
    getChangeRequests(sessionContext.supabase, sessionContext.profile),
  ]);

  return (
    <div className="space-y-6">
      <Panel title="Change request workflow" eyebrow="Engineer → Review → Approval → Implementation">
        <ChangeRequestForm products={products} />
      </Panel>

      <Panel title="Workflow board" eyebrow="Active requests">
        <div className="space-y-4">
          {workflow.changeRequests.map((changeRequest) => {
            const approval = workflow.approvals.find(
              (item) => item.change_request_id === changeRequest.id,
            );
            const product = products.find((item) => item.id === changeRequest.product_id);

            return (
              <div key={changeRequest.id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">{changeRequest.title}</p>
                    <p className="mt-1 text-sm text-steel">{product?.product_name ?? "Product unavailable"}</p>
                  </div>
                  <StatusBadge value={changeRequest.status} />
                </div>
                <p className="mt-4 text-sm leading-6 text-steel">{changeRequest.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-steel">Approval:</span>
                    <StatusBadge value={approval?.status ?? "pending"} />
                  </div>
                  <ChangeRequestStatusForm
                    changeRequestId={changeRequest.id}
                    currentStatus={changeRequest.status}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

