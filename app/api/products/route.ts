import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getProducts } from "@/lib/data/products";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { productLifecyclePayloadSchema, productPayloadSchema } from "@/lib/validation";

export async function GET() {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const products = await getProducts(sessionContext.supabase, sessionContext.profile);

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const environmentStatus = getPublicEnvironmentStatus();

    if (!environmentStatus.isConfigured) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const sessionContext = await getSessionContext();

    if (!sessionContext) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = productPayloadSchema.parse(await request.json());

    const { data: productData, error: productError } = await fromTable(
      sessionContext.supabase,
      "products",
    )
      .insert({
        user_id: sessionContext.profile.id,
        product_name: payload.productName,
        product_sku: payload.productSku,
        product_category: payload.productCategory,
        description: payload.description,
        lifecycle_stage: payload.lifecycleStage,
      })
      .select("*")
      .single();
    const product = asRow<"products">(productData);

    if (productError || !product) {
      return NextResponse.json(
        { error: productError?.message ?? "Unable to create product." },
        { status: 400 },
      );
    }

    const { data: versionData, error: versionError } = await fromTable(
      sessionContext.supabase,
      "product_versions",
    )
      .insert({
        product_id: product.id,
        version_code: payload.versionCode,
        summary: payload.description,
        is_current: true,
        created_by: sessionContext.profile.id,
        released_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    const version = asRow<"product_versions">(versionData);

    if (versionError || !version) {
      return NextResponse.json(
        { error: versionError?.message ?? "Unable to create product version." },
        { status: 400 },
      );
    }

    const { error: productUpdateError } = await fromTable(sessionContext.supabase, "products")
      .update({
        current_version_id: version.id,
      })
      .eq("id", product.id);

    if (productUpdateError) {
      return NextResponse.json(
        { error: productUpdateError.message },
        { status: 400 },
      );
    }

    const { error: bomError } = await fromTable(
      sessionContext.supabase,
      "bill_of_materials",
    ).insert({
      product_id: product.id,
      product_version_id: version.id,
      bom_version: `BOM-${payload.versionCode}`,
    });

    if (bomError) {
      return NextResponse.json({ error: bomError.message }, { status: 400 });
    }

    await createNotification(sessionContext.supabase, {
      userId: sessionContext.profile.id,
      productId: product.id,
      title: "Product created",
      message: `${payload.productName} is now tracked in the portfolio.`,
      level: "success",
      relatedPath: `/dashboard/products/${product.id}`,
    });

    return NextResponse.json({ productId: product.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];

      return NextResponse.json(
        {
          error: firstIssue?.message ?? "Invalid product data.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const environmentStatus = getPublicEnvironmentStatus();

    if (!environmentStatus.isConfigured) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const sessionContext = await getSessionContext();

    if (!sessionContext) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = productLifecyclePayloadSchema.parse(await request.json());

    const { data: productData, error: productError } = await fromTable(
      sessionContext.supabase,
      "products",
    )
      .update({
        lifecycle_stage: payload.lifecycleStage,
      })
      .eq("id", payload.productId)
      .eq("user_id", sessionContext.profile.id)
      .select("id, product_name, lifecycle_stage")
      .single();

    if (productError || !productData) {
      return NextResponse.json(
        { error: productError?.message ?? "Unable to update lifecycle stage." },
        { status: 400 },
      );
    }

    await createNotification(sessionContext.supabase, {
      userId: sessionContext.profile.id,
      productId: productData.id,
      title: "Lifecycle stage updated",
      message: `${productData.product_name} moved to ${payload.lifecycleStage}.`,
      level: "info",
      relatedPath: `/dashboard/products/${productData.id}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];

      return NextResponse.json(
        {
          error: firstIssue?.message ?? "Invalid lifecycle update.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update lifecycle stage." },
      { status: 500 },
    );
  }
}
