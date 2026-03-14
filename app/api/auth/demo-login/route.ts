import { NextResponse } from "next/server";

import { setDemoSessionCookie } from "@/lib/demo-auth";
import { DEMO_WORKSPACE_OWNER_ID, getDemoAccountByEmail, isDemoCredentials } from "@/lib/rbac";
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

  const account = getDemoAccountByEmail(email);

  if (!account) {
    return NextResponse.json({ error: "Demo account is not configured." }, { status: 500 });
  }

  const admin = createSupabaseAdminClient();

  const upsertWithRole = await admin
    .from("users")
    .upsert(
      {
        id: account.id,
        email: account.email,
        full_name: account.fullName,
        role: account.role,
      },
      { onConflict: "id" },
    )
    .select("*")
    .maybeSingle();

  const upsertWithoutRole = !upsertWithRole.error && upsertWithRole.data
    ? upsertWithRole
    : await admin
        .from("users")
        .upsert(
          {
            id: account.id,
            email: account.email,
            full_name: account.fullName,
          },
          { onConflict: "id" },
        )
        .select("*")
        .maybeSingle();

  if (upsertWithoutRole.error) {
    return NextResponse.json(
      { error: upsertWithoutRole.error.message || "Unable to create the demo profile." },
      { status: 500 },
    );
  }

  const { data: workspaceOwner } = await admin
    .from("users")
    .select("id")
    .eq("id", DEMO_WORKSPACE_OWNER_ID)
    .maybeSingle();

  if (!workspaceOwner && account.id !== DEMO_WORKSPACE_OWNER_ID) {
    await admin.from("users").upsert(
      {
        id: DEMO_WORKSPACE_OWNER_ID,
        email: "simra.chandani@bacancy.com",
        full_name: "Simran Chandani",
      },
      { onConflict: "id" },
    );
  }

  await setDemoSessionCookie(account.id);

  return NextResponse.json({
    ok: true,
    profile: {
      id: account.id,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
    },
  });
}
