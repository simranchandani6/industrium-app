import { NextResponse } from "next/server";

import { canManage, getSessionContext } from "@/lib/data/auth";
import { createNotification } from "@/lib/data/notifications";
import { asRow, fromTable } from "@/lib/data/query-helpers";
import { getDocuments } from "@/lib/data/documents";
import { getPublicEnvironmentStatus } from "@/lib/env";
import { documentPayloadSchema } from "@/lib/validation";

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
  const documents = await getDocuments(
    sessionContext.supabase,
    sessionContext.profile,
    productId,
  );

  return NextResponse.json({ documents });
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

  if (!canManage(sessionContext, "manage_compliance")) {
    return NextResponse.json({ error: "Only Compliance Managers can upload regulatory documents." }, { status: 403 });
  }

  const payload = documentPayloadSchema.parse(await request.json());
  const expectedPrefix = `${sessionContext.workspaceOwnerId}/${payload.productId}/`;

  if (!payload.storagePath.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { error: "Document storage path does not match the signed-in user." },
      { status: 400 },
    );
  }

  const { data: latestVersionData } = await fromTable(sessionContext.supabase, "documents")
    .select("version")
    .eq("user_id", sessionContext.workspaceOwnerId)
    .eq("product_id", payload.productId)
    .eq("document_name", payload.documentName)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const latestVersionRecord = asRow<"documents">(latestVersionData);

  const nextVersion = (latestVersionRecord?.version ?? 0) + 1;

  const { data: documentData, error } = await fromTable(sessionContext.supabase, "documents")
    .insert({
      user_id: sessionContext.workspaceOwnerId,
      product_id: payload.productId,
      document_name: payload.documentName,
      document_type: payload.documentType,
      storage_path: payload.storagePath,
      version: nextVersion,
      uploaded_by: sessionContext.profile.id,
    })
    .select("*")
    .single();
  const document = asRow<"documents">(documentData);

  if (error || !document) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create document record." },
      { status: 400 },
    );
  }

  await createNotification(sessionContext.supabase, {
    userId: sessionContext.workspaceOwnerId,
    productId: payload.productId,
    title: "Document uploaded",
    message: `${payload.documentName} was stored in the document register.`,
    level: "success",
    relatedPath: "/dashboard/documents",
  });

  return NextResponse.json({ document }, { status: 201 });
}
