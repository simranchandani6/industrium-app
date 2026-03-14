import { asRows, fromTable } from "@/lib/data/query-helpers";
import { resolveWorkspaceOwnerId } from "@/lib/rbac";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { ReportsSnapshot, UserProfile } from "@/lib/types/plm";

function toBreakdown(records: string[]) {
  const counts = new Map<string, number>();

  for (const record of records) {
    counts.set(record, (counts.get(record) ?? 0) + 1);
  }

  return [...counts.entries()].map(([value, count]) => ({
    value,
    count,
  }));
}

export async function getReportsSnapshot(
  supabase: SupabaseServerClient,
  profile: UserProfile,
): Promise<ReportsSnapshot> {
  const workspaceOwnerId = resolveWorkspaceOwnerId(profile);
  const [
    productsResult,
    documentsResult,
    qualityResult,
    risksResult,
    feedbackResult,
    complianceResult,
  ] = await Promise.all([
    fromTable(supabase, "products")
      .select("*")
      .eq("user_id", workspaceOwnerId)
      .order("updated_at", { ascending: false }),
    fromTable(supabase, "documents").select("*").eq("user_id", workspaceOwnerId),
    fromTable(supabase, "quality_issues").select("*").eq("user_id", workspaceOwnerId),
    fromTable(supabase, "product_risks").select("*").eq("user_id", workspaceOwnerId),
    fromTable(supabase, "customer_feedback").select("*").eq("user_id", workspaceOwnerId),
    fromTable(supabase, "compliance_records").select("*").eq("user_id", workspaceOwnerId),
  ]);

  if (productsResult.error) {
    throw new Error(`Unable to load products report: ${productsResult.error.message}`);
  }

  if (documentsResult.error) {
    throw new Error(`Unable to load document report: ${documentsResult.error.message}`);
  }

  if (qualityResult.error) {
    throw new Error(`Unable to load quality report: ${qualityResult.error.message}`);
  }

  if (risksResult.error) {
    throw new Error(`Unable to load risk report: ${risksResult.error.message}`);
  }

  if (feedbackResult.error) {
    throw new Error(`Unable to load feedback report: ${feedbackResult.error.message}`);
  }

  if (complianceResult.error) {
    throw new Error(`Unable to load compliance report: ${complianceResult.error.message}`);
  }

  const products = asRows<"products">(productsResult.data);
  const documents = asRows<"documents">(documentsResult.data);
  const qualityIssues = asRows<"quality_issues">(qualityResult.data);
  const risks = asRows<"product_risks">(risksResult.data);
  const feedback = asRows<"customer_feedback">(feedbackResult.data);
  const compliance = asRows<"compliance_records">(complianceResult.data);
  const productIds = products.map((product) => product.id);
  const { data: bomData, error: bomError } = productIds.length
    ? await fromTable(supabase, "bill_of_materials").select("*").in("product_id", productIds)
    : { data: [], error: null };

  if (bomError) {
    throw new Error(`Unable to load BOM report: ${bomError.message}`);
  }

  const boms = asRows<"bill_of_materials">(bomData);
  const bomIds = boms.map((bom) => bom.id);
  const { data: componentData, error: componentError } = bomIds.length
    ? await fromTable(supabase, "components").select("*").in("bom_id", bomIds)
    : { data: [], error: null };

  if (componentError) {
    throw new Error(`Unable to load component report: ${componentError.message}`);
  }

  const components = asRows<"components">(componentData);

  const bomByProductId = new Map<string, string>();

  for (const bom of boms) {
    bomByProductId.set(bom.product_id, bom.id);
  }

  const componentTotalsByBomId = new Map<string, number>();

  for (const component of components) {
    const totalCost = Number(component.quantity) * Number(component.unit_cost);
    componentTotalsByBomId.set(
      component.bom_id,
      (componentTotalsByBomId.get(component.bom_id) ?? 0) + totalCost,
    );
  }

  const ratings = feedback
    .map((item) => item.rating)
    .filter((item): item is number => typeof item === "number");

  const averageFeedbackRating = ratings.length
    ? ratings.reduce((sum, item) => sum + item, 0) / ratings.length
    : null;

  return {
    totalProducts: products.length,
    totalComponents: components.length,
    totalDocuments: documents.length,
    openQualityIssues: qualityIssues.filter((issue) =>
      issue.status === "open" || issue.status === "investigating",
    ).length,
    openRisks: risks.filter((risk) =>
      risk.status === "identified" || risk.status === "monitoring",
    ).length,
    averageFeedbackRating,
    lifecycleBreakdown: toBreakdown(products.map((product) => product.lifecycle_stage)).map(
      ({ value, count }) => ({
        stage: value,
        count,
      }),
    ),
    bomCostByProduct: products.map((product) => ({
      productId: product.id,
      productName: product.product_name,
      totalCost: componentTotalsByBomId.get(bomByProductId.get(product.id) ?? "") ?? 0,
    })),
    qualitySeverityBreakdown: toBreakdown(qualityIssues.map((issue) => issue.severity)).map(
      ({ value, count }) => ({
        severity: value,
        count,
      }),
    ),
    complianceStatusBreakdown: toBreakdown(compliance.map((item) => item.status)).map(
      ({ value, count }) => ({
        status: value,
        count,
      }),
    ),
  };
}
