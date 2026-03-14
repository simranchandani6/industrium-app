import { Panel } from "@/components/dashboard/panel";
import { DocumentUploadForm } from "@/components/forms/document-upload-form";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getSessionContext } from "@/lib/data/auth";
import { getDocuments } from "@/lib/data/documents";
import { getProducts } from "@/lib/data/products";

export default async function DocumentsPage() {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const [products, documents] = await Promise.all([
    getProducts(sessionContext.supabase, sessionContext.profile),
    getDocuments(sessionContext.supabase, sessionContext.profile),
  ]);

  return (
    <div className="space-y-6">
      <Panel title="Document management" eyebrow="Supabase Storage">
        <DocumentUploadForm
          ownerId={sessionContext.profile.id}
          products={products}
        />
      </Panel>

      <Panel title="Document register" eyebrow="Engineering artifacts">
        <div className="space-y-4">
          {documents.map((document) => {
            const product = products.find((item) => item.id === document.product_id);

            return (
              <div key={document.id} className="rounded-[24px] border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{document.document_name}</p>
                    <p className="mt-1 text-sm text-steel">
                      {product?.product_name ?? "Unknown product"} • Version {document.version}
                    </p>
                  </div>
                  <StatusBadge value={document.document_type} />
                </div>
                <p className="mt-3 font-mono text-xs text-steel">{document.storage_path}</p>
                <div className="mt-4">
                  {document.signedUrl ? (
                    <a
                      href={document.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-teal"
                    >
                      Open secure file
                    </a>
                  ) : (
                    <span className="text-sm text-steel">File record exists but no signed URL was generated.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
