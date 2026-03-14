import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { QualityIssueRecord, UserProfile } from "@/lib/types/plm";

export async function getQualityIssues(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<QualityIssueRecord[]> {
  const { data, error } = await supabase
    .from("quality_issues")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load quality issues: ${error.message}`);
  }

  return data ?? [];
}
