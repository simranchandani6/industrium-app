import { NextResponse } from "next/server";

import { canManage, getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { processStepPayloadSchema } from "@/lib/validation";

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
    .from("manufacturing_process_steps")
    .select("*")
    .eq("product_id", productId)
    .order("sequence_number");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ processSteps: data ?? [] });
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
    return NextResponse.json({ error: "Only Product Managers can edit the manufacturing plan." }, { status: 403 });
  }

  const payload = processStepPayloadSchema.parse(await request.json());

  const { data: processStepData, error } = await fromTable(
    sessionContext.supabase,
    "manufacturing_process_steps",
  )
    .insert({
      product_id: payload.productId,
      sequence_number: payload.sequenceNumber,
      step_name: payload.stepName,
      workstation: payload.workstation ?? null,
      instructions: payload.instructions,
    })
    .select("*")
    .single();
  const processStep = asRow<"manufacturing_process_steps">(processStepData);

  if (error || !processStep) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to add process step." },
      { status: 400 },
    );
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.workspaceOwnerId,
    productId: payload.productId,
    title: "Manufacturing plan updated",
    message: `${payload.stepName} was added to the process plan.`,
    level: "info",
    relatedPath: `/dashboard/products/${payload.productId}`,
  });

  return NextResponse.json({ processStep }, { status: 201 });
}
