import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { searchPlmRecords } from "@/lib/data/search";
import { getPublicEnvironmentStatus } from "@/lib/env";

export async function GET(request: Request) {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const results = await searchPlmRecords(
    sessionContext.supabase,
    sessionContext.profile,
    query,
  );

  return NextResponse.json(results);
}
