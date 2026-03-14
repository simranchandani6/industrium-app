import { NextResponse } from "next/server";

import { clearDemoSessionCookie } from "@/lib/demo-auth";

export async function POST() {
  await clearDemoSessionCookie();

  return NextResponse.json({ ok: true });
}
