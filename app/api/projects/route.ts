import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { projectPayloadSchema } from "@/lib/validation";

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
    .from("projects")
    .select("*")
    .eq("user_id", sessionContext.profile.id)
    .order("deadline", { ascending: true, nullsFirst: false });

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ projects: data ?? [] });
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

  const payload = projectPayloadSchema.parse(await request.json());

  const { data: projectData, error } = await fromTable(sessionContext.supabase, "projects")
    .insert({
      user_id: sessionContext.profile.id,
      product_id: payload.productId,
      project_name: payload.projectName,
      deadline: payload.deadline ?? null,
      status: payload.status,
    })
    .select("*")
    .single();
  const project = asRow<"projects">(projectData);

  if (error || !project) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create project milestone." },
      { status: 400 },
    );
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.profile.id,
    productId: payload.productId,
    title: "New project milestone",
    message: `${payload.projectName} was added to the product timeline.`,
    level: "info",
    relatedPath: `/dashboard/products/${payload.productId}`,
  });

  return NextResponse.json({ project }, { status: 201 });
}
