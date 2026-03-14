import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { getReportsSnapshot } from "@/lib/data/reports";
import { getPublicEnvironmentStatus } from "@/lib/env";

export async function GET() {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const snapshot = await getReportsSnapshot(
    sessionContext.supabase,
    sessionContext.profile,
  );

  return NextResponse.json({ snapshot });
}
