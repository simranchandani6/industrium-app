import { NextResponse } from "next/server";

import { DEMO_EMAIL, isDemoCredentials } from "@/lib/demo-auth-shared";
import { setDemoSessionCookie } from "@/lib/demo-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let payload: { email?: string; password?: string };

  try {
    payload = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase() ?? "";
  const password = payload.password ?? "";

  if (!isDemoCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid login credentials." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin
    .from("users")
    .select("id, email, full_name")
    .eq("email", DEMO_EMAIL)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { error: "Seeded demo profile is missing from public.users." },
      { status: 500 },
    );
  }

  await setDemoSessionCookie(profile.id);

  return NextResponse.json({
    ok: true,
    profile: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
    },
  });
}
