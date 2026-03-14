import type { SupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceOwnerId } from "@/lib/rbac";
import type { QualityIssueRecord, UserProfile } from "@/lib/types/plm";

export async function getQualityIssues(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<QualityIssueRecord[]> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
  const { data, error } = await supabase
    .from("quality_issues")
    .select("*")
    .eq("user_id", workspaceOwnerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load quality issues: ${error.message}`);
  }

  return data ?? [];
}
