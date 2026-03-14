import { NextResponse } from "next/server";

import { canManage, getSessionContext } from "@/lib/data/auth";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getSuppliers } from "@/lib/data/suppliers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { supplierPayloadSchema } from "@/lib/validation";

export async function GET() {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const suppliers = await getSuppliers(sessionContext.supabase, sessionContext.profile);

  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!canManage(sessionContext, "manage_suppliers")) {
    return NextResponse.json({ error: "Only Supplier Managers can edit supplier records." }, { status: 403 });
  }

  const payload = supplierPayloadSchema.parse(await request.json());

  const { data: supplierData, error } = await fromTable(
    sessionContext.supabase,
    "suppliers",
  )
    .insert({
      user_id: sessionContext.workspaceOwnerId,
      supplier_name: payload.supplierName,
      contact_email: payload.contactEmail,
      country: payload.country,
      status: payload.status,
      performance_score: payload.performanceScore ?? null,
    })
    .select("*")
    .single();
  const supplier = asRow<"suppliers">(supplierData);

  if (error || !supplier) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create supplier." },
      { status: 400 },
    );
  }

  return NextResponse.json({ supplier }, { status: 201 });
}
