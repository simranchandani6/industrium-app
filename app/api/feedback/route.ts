import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { customerFeedbackPayloadSchema } from "@/lib/validation";

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
    .from("customer_feedback")
    .select("*")
    .eq("user_id", sessionContext.profile.id)
    .order("created_at", { ascending: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ feedback: data ?? [] });
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

  const payload = customerFeedbackPayloadSchema.parse(await request.json());

  const { data: feedbackData, error } = await fromTable(
    sessionContext.supabase,
    "customer_feedback",
  )
    .insert({
      user_id: sessionContext.profile.id,
      product_id: payload.productId,
      customer_name: payload.customerName,
      channel: payload.channel,
      rating: payload.rating ?? null,
      feedback_text: payload.feedbackText,
    })
    .select("*")
    .single();
  const feedback = asRow<"customer_feedback">(feedbackData);

  if (error || !feedback) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to save customer feedback." },
      { status: 400 },
    );
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.profile.id,
    productId: payload.productId,
    title: "Customer feedback received",
    message: `${payload.customerName} submitted feedback for this product.`,
    level: "info",
    relatedPath: `/dashboard/products/${payload.productId}`,
  });

  return NextResponse.json({ feedback }, { status: 201 });
}
