import type { Database } from "@/lib/types/database";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type ProductRecord = Database["public"]["Tables"]["products"]["Row"];
export type ProductVersionRecord = Database["public"]["Tables"]["product_versions"]["Row"];
export type BillOfMaterialsRecord = Database["public"]["Tables"]["bill_of_materials"]["Row"];
export type ComponentRecord = Database["public"]["Tables"]["components"]["Row"];
export type SupplierRecord = Database["public"]["Tables"]["suppliers"]["Row"];
export type DocumentRecord = Database["public"]["Tables"]["documents"]["Row"];
export type ChangeRequestRecord = Database["public"]["Tables"]["change_requests"]["Row"];
export type ApprovalRecord = Database["public"]["Tables"]["approvals"]["Row"];
export type QualityIssueRecord = Database["public"]["Tables"]["quality_issues"]["Row"];
export type ProjectRecord = Database["public"]["Tables"]["projects"]["Row"];
export type ManufacturingProcessStepRecord =
  Database["public"]["Tables"]["manufacturing_process_steps"]["Row"];
export type ComplianceRecord = Database["public"]["Tables"]["compliance_records"]["Row"];
export type ProductRiskRecord = Database["public"]["Tables"]["product_risks"]["Row"];
export type CustomerFeedbackRecord = Database["public"]["Tables"]["customer_feedback"]["Row"];
export type NotificationRecord = Database["public"]["Tables"]["notifications"]["Row"];

export type BomNode = ComponentRecord & {
  children: BomNode[];
};

export type ProductSummary = ProductRecord & {
  currentVersion: ProductVersionRecord | null;
  billOfMaterialsCount: number;
  componentCount: number;
  openChangeRequestCount: number;
  openQualityIssueCount: number;
};

export type DashboardSnapshot = {
  productCount: number;
  openQualityIssueCount: number;
  pendingChangeRequestCount: number;
  supplierCount: number;
  openRiskCount: number;
  unreadNotificationCount: number;
  products: ProductSummary[];
  upcomingProjects: ProjectRecord[];
  recentChangeRequests: ChangeRequestRecord[];
  recentQualityIssues: QualityIssueRecord[];
  recentNotifications: NotificationRecord[];
};

export type DocumentWithAccessUrl = DocumentRecord & {
  signedUrl: string | null;
};

export type ProductDetail = {
  product: ProductRecord;
  currentVersion: ProductVersionRecord | null;
  versions: ProductVersionRecord[];
  bom: BillOfMaterialsRecord | null;
  bomTree: BomNode[];
  components: ComponentRecord[];
  suppliers: SupplierRecord[];
  documents: DocumentWithAccessUrl[];
  changeRequests: ChangeRequestRecord[];
  approvals: ApprovalRecord[];
  qualityIssues: QualityIssueRecord[];
  projects: ProjectRecord[];
  processSteps: ManufacturingProcessStepRecord[];
  complianceRecords: ComplianceRecord[];
  risks: ProductRiskRecord[];
  feedback: CustomerFeedbackRecord[];
};

export type ReportsSnapshot = {
  totalProducts: number;
  totalComponents: number;
  totalDocuments: number;
  openQualityIssues: number;
  openRisks: number;
  averageFeedbackRating: number | null;
  lifecycleBreakdown: { stage: string; count: number }[];
  bomCostByProduct: { productId: string; productName: string; totalCost: number }[];
  qualitySeverityBreakdown: { severity: string; count: number }[];
  complianceStatusBreakdown: { status: string; count: number }[];
};

export type SearchResults = {
  query: string;
  products: ProductRecord[];
  documents: DocumentRecord[];
  components: ComponentRecord[];
};
