import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { getNotifications } from "@/lib/data/notifications";
import { fromTable } from "@/lib/data/query-helpers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { notificationStatusPayloadSchema } from "@/lib/validation";

export async function GET() {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const notifications = await getNotifications(
    sessionContext.supabase,
    sessionContext.profile,
    12,
  );

  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = notificationStatusPayloadSchema.parse(await request.json());

  const { error } = await fromTable(sessionContext.supabase, "notifications")
    .update({
      is_read: payload.isRead,
    })
    .eq("user_id", sessionContext.profile.id)
    .eq("id", payload.notificationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
