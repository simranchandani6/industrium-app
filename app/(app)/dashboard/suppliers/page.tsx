import { AccessNotice } from "@/components/dashboard/access-notice";
import { Panel } from "@/components/dashboard/panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { SupplierForm } from "@/components/forms/supplier-form";
import { getSessionContext } from "@/lib/data/auth";
import { getSuppliers } from "@/lib/data/suppliers";
import { hasCapability } from "@/lib/rbac";

export default async function SuppliersPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const suppliers = await getSuppliers(sessionContext.supabase, sessionContext.profile);
  const canManageSuppliers = hasCapability(sessionContext.role, "manage_suppliers");

  return (
    <div className="space-y-6">
      <Panel title="Supplier directory" eyebrow="Vendor management">
        {canManageSuppliers ? (
          <SupplierForm />
        ) : (
          <AccessNotice
            title="Read-only for your role"
            body="Only the Supplier Manager can create or update supplier records in this MVP. You can still review the shared supplier base below."
            detail={sessionContext.roleLabel}
          />
        )}
      </Panel>

      <Panel title="Approved supplier base" eyebrow="Sourcing">
        <div className="grid gap-4 xl:grid-cols-2">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="rounded-[24px] border border-ink/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-ink">{supplier.supplier_name}</p>
                  <p className="mt-1 text-sm text-steel">{supplier.country}</p>
                </div>
                <StatusBadge value={supplier.status} />
              </div>
              <p className="mt-4 text-sm text-steel">{supplier.contact_email}</p>
              <p className="mt-4 text-sm font-medium text-ink">
                Performance score: {supplier.performance_score?.toFixed(1) ?? "Not rated"}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
