import type { SupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceOwnerId } from "@/lib/rbac";
import type { SupplierRecord, UserProfile } from "@/lib/types/plm";

export async function getSuppliers(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<SupplierRecord[]> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("user_id", workspaceOwnerId)
    .order("performance_score", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Unable to load suppliers: ${error.message}`);
  }

  return data ?? [];
}
