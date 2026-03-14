import Link from "next/link";

import { Panel } from "@/components/dashboard/panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getSessionContext } from "@/lib/data/auth";
import { searchPlmRecords } from "@/lib/data/search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const { q = "" } = await searchParams;
  const results = await searchPlmRecords(
    sessionContext.supabase,
    sessionContext.profile,
    q,
  );

  return (
    <div className="space-y-6">
      <Panel title="Search and discovery" eyebrow="Products, documents, and components">
        <form method="get" className="flex flex-col gap-3 lg:flex-row">
          <input
            name="q"
            defaultValue={results.query}
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
            placeholder="Search by SKU, document name, or component"
          />
          <button
            type="submit"
            className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90"
          >
            Search
          </button>
        </form>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Products"
          eyebrow={results.query ? `${results.products.length} matches` : "Run a search"}
        >
          <div className="space-y-3">
            {results.products.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/products/${product.id}`}
                className="block rounded-[22px] border border-ink/10 bg-white p-4 transition hover:border-teal/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{product.product_name}</p>
                    <p className="mt-1 text-sm text-steel">{product.product_sku}</p>
                  </div>
                  <StatusBadge value={product.lifecycle_stage} />
                </div>
              </Link>
            ))}
            {results.products.length === 0 ? (
              <p className="text-sm text-steel">
                {results.query ? "No product matches." : "Search results appear here."}
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel
          title="Documents"
          eyebrow={results.query ? `${results.documents.length} matches` : "Run a search"}
        >
          <div className="space-y-3">
            {results.documents.map((document) => (
              <div key={document.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                <p className="font-medium text-ink">{document.document_name}</p>
                <p className="mt-1 text-sm text-steel">
                  {document.document_type.replaceAll("_", " ")} • Version {document.version}
                </p>
                <div className="mt-3">
                  <StatusBadge value={document.document_type} />
                </div>
              </div>
            ))}
            {results.documents.length === 0 ? (
              <p className="text-sm text-steel">
                {results.query ? "No document matches." : "Search results appear here."}
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel
          title="Components"
          eyebrow={results.query ? `${results.components.length} matches` : "Run a search"}
        >
          <div className="space-y-3">
            {results.components.map((component) => (
              <div key={component.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{component.component_name}</p>
                    <p className="mt-1 text-sm text-steel">
                      {component.component_sku} • {component.manufacturer}
                    </p>
                  </div>
                  <StatusBadge value={component.component_type} />
                </div>
              </div>
            ))}
            {results.components.length === 0 ? (
              <p className="text-sm text-steel">
                {results.query ? "No component matches." : "Search results appear here."}
              </p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
