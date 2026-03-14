import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { SupplierRecord, UserProfile } from "@/lib/types/plm";

export async function getSuppliers(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<SupplierRecord[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("user_id", profile.id)
    .order("performance_score", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Unable to load suppliers: ${error.message}`);
  }

  return data ?? [];
}
