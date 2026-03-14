import type { SupabaseServerClient } from "@/lib/supabase/server";
import { resolveWorkspaceOwnerId } from "@/lib/rbac";
import type { ApprovalRecord, ChangeRequestRecord, UserProfile } from "@/lib/types/plm";

export async function getChangeRequests(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<{ changeRequests: ChangeRequestRecord[]; approvals: ApprovalRecord[] }> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
  const [changeRequestsResult, approvalsResult] = await Promise.all([
    supabase
      .from("change_requests")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("approvals")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  if (changeRequestsResult.error) {
    throw new Error(`Unable to load change requests: ${changeRequestsResult.error.message}`);
  }

  if (approvalsResult.error) {
    throw new Error(`Unable to load approvals: ${approvalsResult.error.message}`);
  }

  return {
    changeRequests: changeRequestsResult.data ?? [],
    approvals: approvalsResult.data ?? [],
  };
}
