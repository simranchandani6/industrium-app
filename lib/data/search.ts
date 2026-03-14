import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
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
  const normalizedQuery = query.toLowerCase();

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
      .order("created_at", { ascending: false })
      .limit(40),
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
    documents: ((documentsResult.data ?? []) as DocumentRow[]).filter((document) => {
      const haystack = [
        document.document_name,
        document.document_type,
        document.storage_path,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    }).slice(0, 8),
    components: componentsResult.data ?? [],
  };
}
  type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
