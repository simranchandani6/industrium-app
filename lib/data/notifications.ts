import { fromTable } from "@/lib/data/query-helpers";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { NotificationRecord, UserProfile } from "@/lib/types/plm";

export async function getNotifications(
  supabase: SupabaseServerClient,
  profile: UserProfile,
  limit = 6,
): Promise<{ notifications: NotificationRecord[]; unreadCount: number }> {
  const [notificationsResult, unreadCountResult] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false),
  ]);

  if (notificationsResult.error) {
    throw new Error(`Unable to load notifications: ${notificationsResult.error.message}`);
  }

  if (unreadCountResult.error) {
    throw new Error(`Unable to load unread notifications: ${unreadCountResult.error.message}`);
  }

  return {
    notifications: notificationsResult.data ?? [],
    unreadCount: unreadCountResult.count ?? 0,
  };
}

type NotificationInput = {
  userId: string;
  productId?: string | null;
  title: string;
  message: string;
  level?: "info" | "success" | "warning";
  relatedPath?: string | null;
};

export async function createNotification(
  supabase: SupabaseServerClient,
  input: NotificationInput,
) {
  await fromTable(supabase, "notifications").insert({
    user_id: input.userId,
    product_id: input.productId ?? null,
    title: input.title,
    message: input.message,
    level: input.level ?? "info",
    related_path: input.relatedPath ?? null,
    is_read: false,
  });
}
