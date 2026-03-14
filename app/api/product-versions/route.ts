import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { productVersionPayloadSchema } from "@/lib/validation";

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

  if (!productId) {
    return NextResponse.json({ error: "productId is required." }, { status: 400 });
  }

  const { data, error } = await sessionContext.supabase
    .from("product_versions")
    .select("*")
    .eq("product_id", productId)
    .order("released_at", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ versions: data ?? [] });
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

  const payload = productVersionPayloadSchema.parse(await request.json());

  if (payload.markAsCurrent) {
    await fromTable(sessionContext.supabase, "product_versions")
      .update({
        is_current: false,
      })
      .eq("product_id", payload.productId)
      .eq("is_current", true);
  }

  const { data: versionData, error } = await fromTable(sessionContext.supabase, "product_versions")
    .insert({
      product_id: payload.productId,
      version_code: payload.versionCode,
      summary: payload.summary,
      is_current: payload.markAsCurrent,
      created_by: sessionContext.profile.id,
      released_at: payload.releasedAt ?? new Date().toISOString(),
    })
    .select("*")
    .single();
  const version = asRow<"product_versions">(versionData);

  if (error || !version) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create product version." },
      { status: 400 },
    );
  }

  if (payload.markAsCurrent) {
    const { error: productError } = await fromTable(sessionContext.supabase, "products")
      .update({
        current_version_id: version.id,
      })
      .eq("user_id", sessionContext.profile.id)
      .eq("id", payload.productId);

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 400 });
    }
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.profile.id,
    productId: payload.productId,
    title: "Configuration version created",
    message: `${payload.versionCode} was added to the product history.`,
    level: payload.markAsCurrent ? "success" : "info",
    relatedPath: `/dashboard/products/${payload.productId}`,
  });

  return NextResponse.json({ version }, { status: 201 });
}
