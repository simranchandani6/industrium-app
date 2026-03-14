import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { compliancePayloadSchema } from "@/lib/validation";

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
  const productId = searchParams.get("productId");

  let query = sessionContext.supabase
    .from("compliance_records")
    .select("*")
    .eq("user_id", sessionContext.profile.id)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ complianceRecords: data ?? [] });
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

  const payload = compliancePayloadSchema.parse(await request.json());

  const { data: complianceData, error } = await fromTable(
    sessionContext.supabase,
    "compliance_records",
  )
    .insert({
      user_id: sessionContext.profile.id,
      product_id: payload.productId,
      document_id: payload.documentId ?? null,
      compliance_name: payload.complianceName,
      authority: payload.authority ?? null,
      status: payload.status,
      due_date: payload.dueDate ?? null,
      notes: payload.notes ?? null,
      validated_at: payload.status === "valid" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();
  const complianceRecord = asRow<"compliance_records">(complianceData);

  if (error || !complianceRecord) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create compliance record." },
      { status: 400 },
    );
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.profile.id,
    productId: payload.productId,
    title: "Compliance register updated",
    message: `${payload.complianceName} is now tracked as ${payload.status.replaceAll("_", " ")}.`,
    level: payload.status === "valid" ? "success" : "warning",
    relatedPath: `/dashboard/products/${payload.productId}`,
  });

  return NextResponse.json({ complianceRecord }, { status: 201 });
}
