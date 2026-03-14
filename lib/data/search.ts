import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { resolveWorkspaceOwnerId } from "@/lib/rbac";
import type { SearchResults, UserProfile } from "@/lib/types/plm";

function escapeLike(value: string) {
  return value.replace(/[%_]/g, "\\$&");
}

export async function searchPlmRecords(
  supabase: SupabaseServerClient,
  profile: UserProfile,
  rawQuery: string,
): Promise<SearchResults> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
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
  const { data: productScopeData, error: productScopeError } = await supabase
    .from("products")
    .select("id")
    .eq("user_id", workspaceOwnerId);

  if (productScopeError) {
    throw new Error(`Unable to load product scope: ${productScopeError.message}`);
  }

  const productIds = ((productScopeData ?? []) as Array<{ id: string }>).map((product) => product.id);
  const { data: bomScopeData, error: bomScopeError } = productIds.length
    ? await supabase
        .from("bill_of_materials")
        .select("id")
        .in("product_id", productIds)
    : { data: [], error: null };

  if (bomScopeError) {
    throw new Error(`Unable to load BOM scope: ${bomScopeError.message}`);
  }

  const bomIds = ((bomScopeData ?? []) as Array<{ id: string }>).map((bom) => bom.id);

  const [productsResult, documentsResult, componentsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .or(
        `product_name.ilike.${likeQuery},product_sku.ilike.${likeQuery},product_category.ilike.${likeQuery},description.ilike.${likeQuery}`,
      )
      .order("updated_at", { ascending: false })
      .limit(8),
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .order("created_at", { ascending: false })
      .limit(40),
    bomIds.length
      ? supabase
          .from("components")
          .select("*")
          .in("bom_id", bomIds)
          .or(
            `component_name.ilike.${likeQuery},component_sku.ilike.${likeQuery},manufacturer.ilike.${likeQuery}`,
          )
          .order("created_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [], error: null }),
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
