import type {
  ChangeRequestStatus,
  ComplianceStatus,
  ComponentType,
  DocumentType,
  FeedbackChannel,
  LifecycleStage,
  NotificationLevel,
  ProjectStatus,
  QualitySeverity,
  QualityStatus,
  RiskStatus,
  SupplierStatus,
} from "@/lib/types/database";

export const lifecycleStageOptions: { label: string; value: LifecycleStage }[] = [
  { label: "Concept", value: "concept" },
  { label: "Design", value: "design" },
  { label: "Prototype", value: "prototype" },
  { label: "Testing", value: "testing" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Launch", value: "launch" },
  { label: "Sustaining", value: "sustaining" },
];

export const documentTypeOptions: { label: string; value: DocumentType }[] = [
  { label: "CAD", value: "cad" },
  { label: "Specification", value: "specification" },
  { label: "Test Report", value: "test_report" },
  { label: "Compliance Certificate", value: "compliance_certificate" },
  { label: "Assembly Instruction", value: "assembly_instruction" },
];

export const supplierStatusOptions: { label: string; value: SupplierStatus }[] = [
  { label: "Preferred", value: "preferred" },
  { label: "Active", value: "active" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Inactive", value: "inactive" },
];

export const changeRequestStatusOptions: { label: string; value: ChangeRequestStatus }[] =
  [
    { label: "Submitted", value: "submitted" },
    { label: "In Review", value: "in_review" },
    { label: "Approved", value: "approved" },
    { label: "Implemented", value: "implemented" },
    { label: "Rejected", value: "rejected" },
  ];

export const qualitySeverityOptions: { label: string; value: QualitySeverity }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

export const qualityStatusOptions: { label: string; value: QualityStatus }[] = [
  { label: "Open", value: "open" },
  { label: "Investigating", value: "investigating" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

export const projectStatusOptions: { label: string; value: ProjectStatus }[] = [
  { label: "Concept", value: "concept" },
  { label: "Design", value: "design" },
  { label: "Prototype", value: "prototype" },
  { label: "Testing", value: "testing" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Launch", value: "launch" },
  { label: "Complete", value: "complete" },
];

export const componentTypeOptions: { label: string; value: ComponentType }[] = [
  { label: "Module", value: "module" },
  { label: "Electrical", value: "electrical" },
  { label: "Mechanical", value: "mechanical" },
  { label: "Sensor", value: "sensor" },
  { label: "Packaging", value: "packaging" },
  { label: "Firmware", value: "firmware" },
];

export const complianceStatusOptions: { label: string; value: ComplianceStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Valid", value: "valid" },
  { label: "Needs Review", value: "needs_review" },
  { label: "Expired", value: "expired" },
];

export const riskStatusOptions: { label: string; value: RiskStatus }[] = [
  { label: "Identified", value: "identified" },
  { label: "Monitoring", value: "monitoring" },
  { label: "Mitigated", value: "mitigated" },
  { label: "Closed", value: "closed" },
];

export const feedbackChannelOptions: { label: string; value: FeedbackChannel }[] = [
  { label: "Email", value: "email" },
  { label: "Support Ticket", value: "support_ticket" },
  { label: "Sales Call", value: "sales_call" },
  { label: "Field Visit", value: "field_visit" },
];

export const notificationLevelOptions: { label: string; value: NotificationLevel }[] = [
  { label: "Info", value: "info" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
];

export const navigationItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/changes", label: "Change Control" },
  { href: "/dashboard/suppliers", label: "Suppliers" },
  { href: "/dashboard/quality", label: "Quality" },
  { href: "/dashboard/search", label: "Search" },
  { href: "/dashboard/reports", label: "Reports" },
];
