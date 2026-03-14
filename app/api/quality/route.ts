import { NextResponse } from "next/server";

import { canManage, getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getQualityIssues } from "@/lib/data/quality";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { qualityPayloadSchema } from "@/lib/validation";

export async function GET() {
  const environmentStatus = getPublicEnvironmentStatus();

  if (!environmentStatus.isConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const qualityIssues = await getQualityIssues(sessionContext.supabase, sessionContext.profile);

  return NextResponse.json({ qualityIssues });
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
    return NextResponse.json({ error: "Only Quality Engineers can log quality issues." }, { status: 403 });
  }

  const payload = qualityPayloadSchema.parse(await request.json());

  const { data: qualityIssueData, error } = await fromTable(
    sessionContext.supabase,
    "quality_issues",
  )
    .insert({
      user_id: sessionContext.workspaceOwnerId,
      product_id: payload.productId,
      issue_title: payload.issueTitle,
      description: payload.description,
      severity: payload.severity,
      status: payload.status,
      reported_by: sessionContext.profile.id,
    })
    .select("*")
    .single();
  const qualityIssue = asRow<"quality_issues">(qualityIssueData);

  if (error || !qualityIssue) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create quality issue." },
      { status: 400 },
    );
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.workspaceOwnerId,
    productId: payload.productId,
    title: "Quality issue logged",
    message: `${payload.issueTitle} was added with ${payload.severity} severity.`,
    level: payload.severity === "critical" || payload.severity === "high" ? "warning" : "info",
    relatedPath: "/dashboard/quality",
  });

  return NextResponse.json({ qualityIssue }, { status: 201 });
}
