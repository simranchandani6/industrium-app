import { NextResponse } from "next/server";

import { canManage, getSessionContext } from "@/lib/data/auth";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getBillOfMaterials } from "@/lib/data/products";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { componentPayloadSchema } from "@/lib/validation";

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
  const productId = searchParams.get("productId") ?? undefined;
  const billOfMaterials = await getBillOfMaterials(
    sessionContext.supabase,
    sessionContext.profile,
    productId,
  );

  return NextResponse.json({ billOfMaterials });
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

  if (!canManage(sessionContext, "manage_products")) {
    return NextResponse.json({ error: "Only Product Managers can manage BOM components." }, { status: 403 });
  }

  const payload = componentPayloadSchema.parse(await request.json());

  const { data: bomData, error: bomError } = await fromTable(
    sessionContext.supabase,
    "bill_of_materials",
  )
    .select("*")
    .eq("id", payload.bomId)
    .single();
  const bom = asRow<"bill_of_materials">(bomData);

  if (bomError || !bom) {
    return NextResponse.json({ error: "BOM not found." }, { status: 404 });
  }

  const { data: componentData, error: componentError } = await fromTable(
    sessionContext.supabase,
    "components",
  )
    .insert({
      bom_id: bom.id,
      parent_component_id: payload.parentComponentId ?? null,
      supplier_id: payload.supplierId ?? null,
      component_name: payload.componentName,
      component_sku: payload.componentSku,
      component_type: payload.componentType,
      manufacturer: payload.manufacturer,
      quantity: payload.quantity,
      unit_cost: payload.unitCost,
    })
    .select("*")
    .single();
  const component = asRow<"components">(componentData);

  if (componentError || !component) {
    return NextResponse.json(
      { error: componentError?.message ?? "Unable to create component." },
      { status: 400 },
    );
  }

  return NextResponse.json({ component }, { status: 201 });
}
