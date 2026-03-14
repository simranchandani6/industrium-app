import type { SupabaseServerClient } from "@/lib/supabase/server";
import { asRows } from "@/lib/data/query-helpers";
import type { DocumentWithAccessUrl, UserProfile } from "@/lib/types/plm";

export async function getDocuments(
  supabase: SupabaseServerClient,
  profile: UserProfile,
  productId?: string,
): Promise<DocumentWithAccessUrl[]> {
  let query = supabase
    .from("documents")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load documents: ${error.message}`);
  }

  const documents = asRows<"documents">(data);

  return Promise.all(
    documents.map(async (document) => {
      const { data: signedUrlData } = await supabase.storage
        .from("product-documents")
        .createSignedUrl(document.storage_path, 60 * 60);

      return {
        ...document,
        signedUrl: signedUrlData?.signedUrl ?? null,
      };
    }),
  );
}
