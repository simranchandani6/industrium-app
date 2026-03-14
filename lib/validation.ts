import { z } from "zod";

export const productPayloadSchema = z.object({
  productName: z.string().trim().min(3),
  productSku: z.string().trim().min(3),
  productCategory: z.string().trim().min(2),
  description: z.string().trim().min(10),
  lifecycleStage: z.enum([
    "concept",
    "design",
    "prototype",
    "testing",
    "manufacturing",
    "launch",
    "sustaining",
  ]),
  versionCode: z.string().trim().min(1),
});

export const componentPayloadSchema = z.object({
  bomId: z.string().uuid(),
  parentComponentId: z.string().uuid().nullable().optional(),
  supplierId: z.string().uuid().nullable().optional(),
  componentName: z.string().min(3),
  componentSku: z.string().min(3),
  componentType: z.enum([
    "module",
    "electrical",
    "mechanical",
    "sensor",
    "packaging",
    "firmware",
  ]),
  manufacturer: z.string().min(2),
  quantity: z.number().positive(),
  unitCost: z.number().min(0),
});

export const documentPayloadSchema = z.object({
  productId: z.string().uuid(),
  documentName: z.string().min(3),
  documentType: z.enum([
    "cad",
    "specification",
    "test_report",
    "compliance_certificate",
    "assembly_instruction",
  ]),
  storagePath: z.string().min(3),
});

export const supplierPayloadSchema = z.object({
  supplierName: z.string().min(3),
  contactEmail: z.string().email(),
  country: z.string().min(2),
  status: z.enum(["active", "onboarding", "preferred", "inactive"]),
  performanceScore: z.number().min(0).max(100).nullable().optional(),
});

export const qualityPayloadSchema = z.object({
  productId: z.string().uuid(),
  issueTitle: z.string().min(3),
  description: z.string().min(10),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "investigating", "resolved", "closed"]),
});

export const changeRequestPayloadSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
});

export const changeRequestStatusPayloadSchema = z.object({
  changeRequestId: z.string().uuid(),
  status: z.enum(["submitted", "in_review", "approved", "implemented", "rejected"]),
});

export const projectPayloadSchema = z.object({
  productId: z.string().uuid(),
  projectName: z.string().min(3),
  deadline: z.string().date().nullable().optional(),
  status: z.enum([
    "concept",
    "design",
    "prototype",
    "testing",
    "manufacturing",
    "launch",
    "complete",
  ]),
});

export const productVersionPayloadSchema = z.object({
  productId: z.string().uuid(),
  versionCode: z.string().trim().min(1),
  summary: z.string().trim().min(10),
  releasedAt: z.string().datetime().nullable().optional(),
  markAsCurrent: z.boolean().default(true),
});

export const processStepPayloadSchema = z.object({
  productId: z.string().uuid(),
  sequenceNumber: z.number().int().positive(),
  stepName: z.string().min(3),
  workstation: z.string().min(2).nullable().optional(),
  instructions: z.string().min(10),
});

export const compliancePayloadSchema = z.object({
  productId: z.string().uuid(),
  documentId: z.string().uuid().nullable().optional(),
  complianceName: z.string().min(3),
  authority: z.string().min(2).nullable().optional(),
  status: z.enum(["pending", "valid", "needs_review", "expired"]),
  dueDate: z.string().date().nullable().optional(),
  notes: z.string().min(5).nullable().optional(),
});

export const riskPayloadSchema = z.object({
  productId: z.string().uuid(),
  riskTitle: z.string().min(3),
  description: z.string().min(10),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["identified", "monitoring", "mitigated", "closed"]),
  mitigationPlan: z.string().min(5).nullable().optional(),
  ownerName: z.string().min(2).nullable().optional(),
});

export const customerFeedbackPayloadSchema = z.object({
  productId: z.string().uuid(),
  customerName: z.string().min(2),
  channel: z.enum(["email", "support_ticket", "sales_call", "field_visit"]),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  feedbackText: z.string().min(10),
});

export const notificationStatusPayloadSchema = z.object({
  notificationId: z.string().uuid(),
  isRead: z.boolean(),
});
