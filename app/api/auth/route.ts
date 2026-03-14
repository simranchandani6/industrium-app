import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { getPublicEnvironmentStatus } from "@/lib/env";

export async function GET() {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 503 },
    );
  }

  const sessionContext = await getSessionContext();

  return NextResponse.json({
    authenticated: Boolean(sessionContext),
    user: sessionContext?.user ?? null,
    profile: sessionContext?.profile ?? null,
    role: sessionContext?.role ?? null,
    workspaceOwnerId: sessionContext?.workspaceOwnerId ?? null,
  });
}

export async function POST() {
  return NextResponse.json({
    message: "Use the Supabase browser client to manage login and logout for this session.",
  });
}

