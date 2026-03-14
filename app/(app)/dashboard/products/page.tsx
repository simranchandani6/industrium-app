import Link from "next/link";

import { Panel } from "@/components/dashboard/panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProductForm } from "@/components/forms/product-form";
import { getSessionContext } from "@/lib/data/auth";
import { getProducts } from "@/lib/data/products";

export default async function ProductsPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const products = await getProducts(sessionContext.supabase, sessionContext.profile);

  return (
    <div className="space-y-6">
      <Panel
        title="Products module"
        eyebrow="Product lifecycle management"
        actions={<p className="text-sm text-steel">{products.length} tracked products</p>}
      >
        <ProductForm />
      </Panel>

      <Panel title="Product catalog" eyebrow="Current portfolio">
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-ink/20 bg-surface p-10 text-center">
              <p className="text-lg font-semibold text-ink">No products yet</p>
              <p className="mt-2 text-sm text-steel">
                Use the form above to create your first product.
              </p>
            </div>
          ) : null}
          {products.map((product) => (
            <div key={product.id} className="rounded-[24px] border border-ink/10 bg-white p-5">
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
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-surface px-3 py-1 text-steel">
                  Version {product.currentVersion?.version_code ?? "Unreleased"}
                </span>
                <span className="rounded-full bg-surface px-3 py-1 text-steel">
                  {product.componentCount} components
                </span>
                <span className="rounded-full bg-surface px-3 py-1 text-steel">
                  {product.openChangeRequestCount} open changes
                </span>
                <span className="rounded-full bg-surface px-3 py-1 text-steel">
                  {product.openQualityIssueCount} open quality issues
                </span>
              </div>
              <Link
                href={`/dashboard/products/${product.id}`}
                className="mt-5 inline-flex text-sm font-medium text-teal"
              >
                Open product detail
              </Link>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

