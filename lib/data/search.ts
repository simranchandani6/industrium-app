import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { SearchResults, UserProfile } from "@/lib/types/plm";

function escapeLike(value: string) {
  return value.replace(/[%_]/g, "\\$&");
}

export async function searchPlmRecords(
  supabase: SupabaseServerClient,
  profile: UserProfile,
  rawQuery: string,
): Promise<SearchResults> {
  const query = rawQuery.trim();

  if (!query) {
    return {
      query,
      products: [],
      documents: [],
      components: [],
    };
  }

  const likeQuery = `%${escapeLike(query)}%`;

  const [productsResult, documentsResult, componentsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("user_id", profile.id)
      .or(
        `product_name.ilike.${likeQuery},product_sku.ilike.${likeQuery},product_category.ilike.${likeQuery},description.ilike.${likeQuery}`,
      )
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", profile.id)
      .or(
        `document_name.ilike.${likeQuery},document_type.ilike.${likeQuery},storage_path.ilike.${likeQuery}`,
      )
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("components")
      .select("*")
      .or(
        `component_name.ilike.${likeQuery},component_sku.ilike.${likeQuery},manufacturer.ilike.${likeQuery}`,
      )
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (productsResult.error) {
    throw new Error(`Unable to search products: ${productsResult.error.message}`);
  }

  if (documentsResult.error) {
    throw new Error(`Unable to search documents: ${documentsResult.error.message}`);
  }

  if (componentsResult.error) {
    throw new Error(`Unable to search components: ${componentsResult.error.message}`);
  }

  return {
    query,
    products: productsResult.data ?? [],
    documents: documentsResult.data ?? [],
    components: componentsResult.data ?? [],
  };
}
