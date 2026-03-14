import type { SupabaseServerClient } from "@/lib/supabase/server";
import { asRow, asRows, fromTable } from "@/lib/data/query-helpers";
import { resolveWorkspaceOwnerId } from "@/lib/rbac";
import type {
  BillOfMaterialsRecord,
  BomNode,
  ComponentRecord,
  ProductDetail,
  ProductSummary,
  UserProfile,
} from "@/lib/types/plm";

function assertNoError(error: Error | null, message: string) {
  if (error) {
    throw new Error(`${message}: ${error.message}`);
  }
}

export async function getProducts(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<ProductSummary[]> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
  const { data: productData, error: productsError } = await fromTable(supabase, "products")
    .select("*")
    .eq("user_id", workspaceOwnerId)
    .order("updated_at", { ascending: false });

  assertNoError(productsError, "Unable to load products");
  const products = asRows<"products">(productData);

  const productIds = products.map((product) => product.id);
  const currentVersionIds = products
    .map((product) => product.current_version_id)
    .filter((value): value is string => Boolean(value));

  const [versionResult, bomResult, changeResult, qualityResult] = await Promise.all([
    currentVersionIds.length > 0
      ? fromTable(supabase, "product_versions")
          .select("*")
          .in("id", currentVersionIds)
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? fromTable(supabase, "bill_of_materials")
          .select("*")
          .in("product_id", productIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? fromTable(supabase, "components").select("*")
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? fromTable(supabase, "change_requests")
          .select("*")
          .eq("user_id", workspaceOwnerId)
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? fromTable(supabase, "quality_issues")
          .select("*")
          .eq("user_id", workspaceOwnerId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  assertNoError(versionResult.error, "Unable to load product versions");
  assertNoError(bomResult.error, "Unable to load bills of materials");
  assertNoError(changeResult.error, "Unable to load change requests");
  assertNoError(qualityResult.error, "Unable to load quality issues");

  const versions = asRows<"product_versions">(versionResult.data);
  const boms = asRows<"bill_of_materials">(bomResult.data);
  const changeRequests = asRows<"change_requests">(changeResult.data);
  const qualityIssues = asRows<"quality_issues">(qualityResult.data);
  const bomIds = boms.map((bom) => bom.id);
  const { data: componentData, error: componentError } = bomIds.length
    ? await fromTable(supabase, "components")
        .select("*")
        .in("bom_id", bomIds)
    : { data: [], error: null };

  assertNoError(componentError, "Unable to load components");
  const components = asRows<"components">(componentData);

  const versionsById = new Map(versions.map((version) => [version.id, version]));
  const bomsByProductId = new Map<string, BillOfMaterialsRecord>();
  const componentCountsByBomId = new Map<string, number>();
  const openChangeRequestsByProductId = new Map<string, number>();
  const openQualityIssuesByProductId = new Map<string, number>();

  for (const bom of boms) {
    if (!bomsByProductId.has(bom.product_id)) {
      bomsByProductId.set(bom.product_id, bom);
    }
  }

  for (const component of components) {
    componentCountsByBomId.set(
      component.bom_id,
      (componentCountsByBomId.get(component.bom_id) ?? 0) + 1,
    );
  }

  for (const changeRequest of changeRequests) {
    if (changeRequest.status === "submitted" || changeRequest.status === "in_review") {
      openChangeRequestsByProductId.set(
        changeRequest.product_id,
        (openChangeRequestsByProductId.get(changeRequest.product_id) ?? 0) + 1,
      );
    }
  }

  for (const qualityIssue of qualityIssues) {
    if (qualityIssue.status === "open" || qualityIssue.status === "investigating") {
      openQualityIssuesByProductId.set(
        qualityIssue.product_id,
        (openQualityIssuesByProductId.get(qualityIssue.product_id) ?? 0) + 1,
      );
    }
  }

  return products.map((product) => {
    const bom = bomsByProductId.get(product.id);

    return {
      ...product,
      currentVersion: product.current_version_id
        ? versionsById.get(product.current_version_id) ?? null
        : null,
      billOfMaterialsCount: bom ? 1 : 0,
      componentCount: bom ? componentCountsByBomId.get(bom.id) ?? 0 : 0,
      openChangeRequestCount: openChangeRequestsByProductId.get(product.id) ?? 0,
      openQualityIssueCount: openQualityIssuesByProductId.get(product.id) ?? 0,
    };
  });
}

export function buildBomTree(components: ComponentRecord[]): BomNode[] {
  const nodeMap = new Map<string, BomNode>();

  for (const component of components) {
    nodeMap.set(component.id, {
      ...component,
      children: [],
    });
  }

  const rootNodes: BomNode[] = [];

  for (const component of components) {
    const node = nodeMap.get(component.id);

    if (!node) {
      continue;
    }

    if (component.parent_component_id) {
      const parentNode = nodeMap.get(component.parent_component_id);

      if (parentNode) {
        parentNode.children.push(node);
        continue;
      }
    }

    rootNodes.push(node);
  }

  return rootNodes;
}

export async function getProductDetail(
  supabase: SupabaseServerClient,
  profile: UserProfile,
  productId: string,
): Promise<ProductDetail | null> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
  const { data: productData, error: productError } = await fromTable(supabase, "products")
    .select("*")
    .eq("user_id", workspaceOwnerId)
    .eq("id", productId)
    .single();

  const product = asRow<"products">(productData);

  if (productError || !product) {
    return null;
  }

  const [
    versionsResult,
    bomResult,
    suppliersResult,
    documentsResult,
    changeRequestsResult,
    approvalsResult,
    qualityIssuesResult,
    projectsResult,
    processStepsResult,
    complianceResult,
    risksResult,
    feedbackResult,
  ] = await Promise.all([
    fromTable(supabase, "product_versions")
      .select("*")
      .eq("product_id", productId)
      .order("released_at", { ascending: false, nullsFirst: false }),
    fromTable(supabase, "bill_of_materials")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    fromTable(supabase, "suppliers")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .order("supplier_name"),
    fromTable(supabase, "documents")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
    fromTable(supabase, "change_requests")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
    fromTable(supabase, "approvals")
      .select("*")
      .order("created_at", { ascending: false }),
    fromTable(supabase, "quality_issues")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
    fromTable(supabase, "projects")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .eq("product_id", productId)
      .order("deadline"),
    fromTable(supabase, "manufacturing_process_steps")
      .select("*")
      .eq("product_id", productId)
      .order("sequence_number"),
    fromTable(supabase, "compliance_records")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .eq("product_id", productId)
      .order("due_date", { ascending: true, nullsFirst: false }),
    fromTable(supabase, "product_risks")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
    fromTable(supabase, "customer_feedback")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .eq("product_id", productId)
      .order("created_at", { ascending: false }),
  ]);

  assertNoError(versionsResult.error, "Unable to load product versions");
  assertNoError(bomResult.error, "Unable to load bill of materials");
  assertNoError(suppliersResult.error, "Unable to load suppliers");
  assertNoError(documentsResult.error, "Unable to load documents");
  assertNoError(changeRequestsResult.error, "Unable to load change requests");
  assertNoError(approvalsResult.error, "Unable to load approvals");
  assertNoError(qualityIssuesResult.error, "Unable to load quality issues");
  assertNoError(projectsResult.error, "Unable to load projects");
  assertNoError(processStepsResult.error, "Unable to load manufacturing process steps");
  assertNoError(complianceResult.error, "Unable to load compliance records");
  assertNoError(risksResult.error, "Unable to load product risks");
  assertNoError(feedbackResult.error, "Unable to load customer feedback");

  const versions = asRows<"product_versions">(versionsResult.data);
  const bom = asRow<"bill_of_materials">(bomResult.data);
  const suppliers = asRows<"suppliers">(suppliersResult.data);
  const documentRows = asRows<"documents">(documentsResult.data);
  const changeRequests = asRows<"change_requests">(changeRequestsResult.data);
  const approvals = asRows<"approvals">(approvalsResult.data);
  const qualityIssues = asRows<"quality_issues">(qualityIssuesResult.data);
  const projects = asRows<"projects">(projectsResult.data);
  const processSteps = asRows<"manufacturing_process_steps">(processStepsResult.data);
  const complianceRecords = asRows<"compliance_records">(complianceResult.data);
  const risks = asRows<"product_risks">(risksResult.data);
  const feedback = asRows<"customer_feedback">(feedbackResult.data);
  let componentRows: ComponentRecord[] = [];

  if (bom) {
    const { data: componentsData, error: componentsError } = await fromTable(supabase, "components")
      .select("*")
      .eq("bom_id", bom.id)
      .order("created_at");

    assertNoError(componentsError, "Unable to load BOM components");
    componentRows = asRows<"components">(componentsData);
  }

  const documentsWithUrls = await Promise.all(
    documentRows.map(async (document) => {
      const { data } = await supabase.storage
        .from("product-documents")
        .createSignedUrl(document.storage_path, 60 * 60);

      return {
        ...document,
        signedUrl: data?.signedUrl ?? null,
      };
    }),
  );

  return {
    product,
    currentVersion: product.current_version_id
      ? versions.find((version) => version.id === product.current_version_id) ?? null
      : null,
    versions,
    bom,
    bomTree: buildBomTree(componentRows),
    components: componentRows,
    suppliers,
    documents: documentsWithUrls,
    changeRequests,
    approvals: approvals.filter((approval) =>
      changeRequests.some(
        (changeRequest) => changeRequest.id === approval.change_request_id,
      ),
    ),
    qualityIssues,
    projects,
    processSteps,
    complianceRecords,
    risks,
    feedback,
  };
}

export async function getBillOfMaterials(
  supabase: SupabaseServerClient,
  profile: UserProfile,
  productId?: string,
): Promise<{ bom: BillOfMaterialsRecord; tree: BomNode[] }[]> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
  const { data: workspaceProducts, error: workspaceProductsError } = await fromTable(supabase, "products")
    .select("id")
    .eq("user_id", workspaceOwnerId)
    .order("updated_at", { ascending: false });

  assertNoError(workspaceProductsError, "Unable to load workspace products");
  const workspaceProductIds = asRows<"products">(workspaceProducts).map((product) => product.id);
  const filteredProductIds = productId ? [productId] : workspaceProductIds;

  if (filteredProductIds.length === 0) {
    return [];
  }

  const billOfMaterialsQuery = fromTable(supabase, "bill_of_materials")
    .select("*")
    .in("product_id", filteredProductIds)
    .order("created_at", { ascending: false });

  const { data: billOfMaterials, error: billOfMaterialsError } = await billOfMaterialsQuery;

  assertNoError(billOfMaterialsError, "Unable to load bills of materials");

  const boms = asRows<"bill_of_materials">(billOfMaterials);
  const bomIds = boms.map((bom) => bom.id);

  const { data: components, error: componentsError } = bomIds.length
    ? await fromTable(supabase, "components")
        .select("*")
        .in("bom_id", bomIds)
        .order("created_at")
    : { data: [], error: null };

  assertNoError(componentsError, "Unable to load components");
  const componentRows = asRows<"components">(components);

  return boms.map((bom) => ({
    bom,
    tree: buildBomTree(componentRows.filter((component) => component.bom_id === bom.id)),
  }));
}
