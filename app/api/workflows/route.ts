import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getChangeRequests } from "@/lib/data/change-requests";
import { getPublicEnvironmentStatus } from "@/lib/env";
import {
  changeRequestPayloadSchema,
  changeRequestStatusPayloadSchema,
} from "@/lib/validation";

export async function GET() {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workflow = await getChangeRequests(sessionContext.supabase, sessionContext.profile);

  return NextResponse.json(workflow);
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

  const payload = changeRequestPayloadSchema.parse(await request.json());

  const { data: changeRequestData, error } = await fromTable(
    sessionContext.supabase,
    "change_requests",
  )
    .insert({
      user_id: sessionContext.profile.id,
      product_id: payload.productId,
      title: payload.title,
      description: payload.description,
      status: "submitted",
      requested_by: sessionContext.profile.id,
    })
    .select("*")
    .single();
  const changeRequest = asRow<"change_requests">(changeRequestData);

  if (error || !changeRequest) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create change request." },
      { status: 400 },
    );
  }

  const { error: approvalError } = await fromTable(
    sessionContext.supabase,
    "approvals",
  ).insert({
    change_request_id: changeRequest.id,
    approver_id: sessionContext.profile.id,
    status: "pending",
  });

  if (approvalError) {
    return NextResponse.json({ error: approvalError.message }, { status: 400 });
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.profile.id,
    productId: payload.productId,
    title: "Change request submitted",
    message: `${payload.title} entered the workflow board.`,
    level: "warning",
    relatedPath: "/dashboard/changes",
  });

  return NextResponse.json({ changeRequest }, { status: 201 });
}

export async function PATCH(request: Request) {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = changeRequestStatusPayloadSchema.parse(await request.json());

  const { data: changeRequestData, error } = await fromTable(
    sessionContext.supabase,
    "change_requests",
  )
    .update({
      status: payload.status,
    })
    .eq("user_id", sessionContext.profile.id)
    .eq("id", payload.changeRequestId)
    .select("*")
    .single();
  const changeRequest = asRow<"change_requests">(changeRequestData);

  if (error || !changeRequest) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to update change request." },
      { status: 400 },
    );
  }

  if (payload.status === "approved" || payload.status === "rejected") {
    const { data: approvalData } = await fromTable(sessionContext.supabase, "approvals")
      .select("*")
      .eq("change_request_id", payload.changeRequestId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const approval = asRow<"approvals">(approvalData);

    if (approval) {
      await fromTable(sessionContext.supabase, "approvals")
        .update({
          approver_id: sessionContext.profile.id,
          status: payload.status === "approved" ? "approved" : "rejected",
          approved_at: new Date().toISOString(),
        })
        .eq("id", approval.id);
    } else {
      await fromTable(sessionContext.supabase, "approvals").insert({
        change_request_id: payload.changeRequestId,
        approver_id: sessionContext.profile.id,
        status: payload.status === "approved" ? "approved" : "rejected",
        approved_at: new Date().toISOString(),
      });
    }
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.profile.id,
    productId: changeRequest.product_id,
    title: "Change request updated",
    message: `${changeRequest.title} moved to ${payload.status.replaceAll("_", " ")}.`,
    level: payload.status === "approved" ? "success" : "warning",
    relatedPath: "/dashboard/changes",
  });

  return NextResponse.json({ changeRequest });
}
