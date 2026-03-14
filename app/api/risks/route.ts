import { NextResponse } from "next/server";

import { canManage, getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { riskPayloadSchema } from "@/lib/validation";

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
    .from("product_risks")
    .select("*")
    .eq("user_id", sessionContext.workspaceOwnerId)
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ risks: data ?? [] });
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

  if (!canManage(sessionContext, "manage_quality")) {
    return NextResponse.json({ error: "Only Quality Engineers can manage product risks." }, { status: 403 });
  }

  const payload = riskPayloadSchema.parse(await request.json());

  const { data: riskData, error } = await fromTable(sessionContext.supabase, "product_risks")
    .insert({
      user_id: sessionContext.workspaceOwnerId,
      product_id: payload.productId,
      risk_title: payload.riskTitle,
      description: payload.description,
      severity: payload.severity,
      status: payload.status,
      mitigation_plan: payload.mitigationPlan ?? null,
      owner_name: payload.ownerName ?? null,
    })
    .select("*")
    .single();
  const risk = asRow<"product_risks">(riskData);

  if (error || !risk) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create risk entry." },
      { status: 400 },
    );
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.workspaceOwnerId,
    productId: payload.productId,
    title: "Risk register updated",
    message: `${payload.riskTitle} was added with ${payload.severity} severity.`,
    level: payload.severity === "critical" || payload.severity === "high" ? "warning" : "info",
    relatedPath: `/dashboard/products/${payload.productId}`,
  });

  return NextResponse.json({ risk }, { status: 201 });
}
