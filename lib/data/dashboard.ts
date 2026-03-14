import { getProducts } from "@/lib/data/products";
import { getNotifications } from "@/lib/data/notifications";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardSnapshot, UserProfile } from "@/lib/types/plm";

function normalizeCount(count: number | null) {
  return count ?? 0;
}

export async function getDashboardSnapshot(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<DashboardSnapshot> {
  const [products, notifications, productCountResult, qualityCountResult, changeCountResult, supplierCountResult, riskCountResult, projectsResult, recentChangeRequestsResult, recentQualityIssuesResult] =
    await Promise.all([
      getProducts(supabase, profile),
      getNotifications(supabase, profile),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id),
      supabase
        .from("quality_issues")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .in("status", ["open", "investigating"]),
      supabase
        .from("change_requests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .in("status", ["submitted", "in_review"]),
      supabase
        .from("suppliers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id),
      supabase
        .from("product_risks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .in("status", ["identified", "monitoring"]),
      supabase
        .from("projects")
        .select("*")
        .eq("user_id", profile.id)
        .order("deadline")
        .limit(4),
      supabase
        .from("change_requests")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("quality_issues")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    productCount: normalizeCount(productCountResult.count),
    openQualityIssueCount: normalizeCount(qualityCountResult.count),
    pendingChangeRequestCount: normalizeCount(changeCountResult.count),
    supplierCount: normalizeCount(supplierCountResult.count),
    openRiskCount: normalizeCount(riskCountResult.count),
    unreadNotificationCount: notifications.unreadCount,
    products,
    upcomingProjects: projectsResult.data ?? [],
    recentChangeRequests: recentChangeRequestsResult.data ?? [],
    recentQualityIssues: recentQualityIssuesResult.data ?? [],
    recentNotifications: notifications.notifications,
  };
}
