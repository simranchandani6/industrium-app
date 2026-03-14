export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LifecycleStage =
  | "concept"
  | "design"
  | "prototype"
  | "testing"
  | "manufacturing"
  | "launch"
  | "sustaining";

export type DocumentType =
  | "cad"
  | "specification"
  | "test_report"
  | "compliance_certificate"
  | "assembly_instruction";

export type SupplierStatus = "active" | "onboarding" | "preferred" | "inactive";

export type ChangeRequestStatus =
  | "submitted"
  | "in_review"
  | "approved"
  | "implemented"
  | "rejected";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type QualitySeverity = "low" | "medium" | "high" | "critical";

export type QualityStatus = "open" | "investigating" | "resolved" | "closed";

export type ProjectStatus =
  | "concept"
  | "design"
  | "prototype"
  | "testing"
  | "manufacturing"
  | "launch"
  | "complete";

export type ComponentType =
  | "module"
  | "electrical"
  | "mechanical"
  | "sensor"
  | "packaging"
  | "firmware";

export type ComplianceStatus = "pending" | "valid" | "needs_review" | "expired";

export type RiskStatus = "identified" | "monitoring" | "mitigated" | "closed";

export type FeedbackChannel =
  | "email"
  | "support_ticket"
  | "sales_call"
  | "field_visit";

export type NotificationLevel = "info" | "success" | "warning";

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      users: TableDefinition<
        {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          email: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      products: TableDefinition<
        {
          id: string;
          user_id: string;
          product_name: string;
          product_sku: string;
          product_category: string;
          description: string | null;
          lifecycle_stage: LifecycleStage;
          current_version_id: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_name: string;
          product_sku: string;
          product_category: string;
          description?: string | null;
          lifecycle_stage: LifecycleStage;
          current_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_name?: string;
          product_sku?: string;
          product_category?: string;
          description?: string | null;
          lifecycle_stage?: LifecycleStage;
          current_version_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      product_versions: TableDefinition<
        {
          id: string;
          product_id: string;
          version_code: string;
          summary: string | null;
          is_current: boolean;
          created_by: string | null;
          released_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          product_id: string;
          version_code: string;
          summary?: string | null;
          is_current?: boolean;
          created_by?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          product_id?: string;
          version_code?: string;
          summary?: string | null;
          is_current?: boolean;
          created_by?: string | null;
          released_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      bill_of_materials: TableDefinition<
        {
          id: string;
          product_id: string;
          product_version_id: string | null;
          bom_version: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          product_id: string;
          product_version_id?: string | null;
          bom_version: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          product_id?: string;
          product_version_id?: string | null;
          bom_version?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      suppliers: TableDefinition<
        {
          id: string;
          user_id: string;
          supplier_name: string;
          contact_email: string;
          country: string;
          status: SupplierStatus;
          performance_score: number | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          supplier_name: string;
          contact_email: string;
          country: string;
          status: SupplierStatus;
          performance_score?: number | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          supplier_name?: string;
          contact_email?: string;
          country?: string;
          status?: SupplierStatus;
          performance_score?: number | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      components: TableDefinition<
        {
          id: string;
          bom_id: string;
          parent_component_id: string | null;
          supplier_id: string | null;
          component_name: string;
          component_sku: string;
          component_type: ComponentType;
          manufacturer: string;
          quantity: number;
          unit_cost: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          bom_id: string;
          parent_component_id?: string | null;
          supplier_id?: string | null;
          component_name: string;
          component_sku: string;
          component_type: ComponentType;
          manufacturer: string;
          quantity: number;
          unit_cost: number;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          bom_id?: string;
          parent_component_id?: string | null;
          supplier_id?: string | null;
          component_name?: string;
          component_sku?: string;
          component_type?: ComponentType;
          manufacturer?: string;
          quantity?: number;
          unit_cost?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      documents: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string;
          document_name: string;
          document_type: DocumentType;
          file_url: string | null;
          storage_path: string;
          version: number;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          document_name: string;
          document_type: DocumentType;
          file_url?: string | null;
          storage_path: string;
          version?: number;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string;
          document_name?: string;
          document_type?: DocumentType;
          file_url?: string | null;
          storage_path?: string;
          version?: number;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      change_requests: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string;
          title: string;
          description: string;
          status: ChangeRequestStatus;
          requested_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          title: string;
          description: string;
          status?: ChangeRequestStatus;
          requested_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string;
          title?: string;
          description?: string;
          status?: ChangeRequestStatus;
          requested_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      approvals: TableDefinition<
        {
          id: string;
          change_request_id: string;
          approver_id: string | null;
          status: ApprovalStatus;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          change_request_id: string;
          approver_id?: string | null;
          status?: ApprovalStatus;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          change_request_id?: string;
          approver_id?: string | null;
          status?: ApprovalStatus;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      quality_issues: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string;
          issue_title: string;
          description: string;
          severity: QualitySeverity;
          status: QualityStatus;
          reported_by: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          issue_title: string;
          description: string;
          severity: QualitySeverity;
          status?: QualityStatus;
          reported_by?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string;
          issue_title?: string;
          description?: string;
          severity?: QualitySeverity;
          status?: QualityStatus;
          reported_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      projects: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string;
          project_name: string;
          deadline: string | null;
          status: ProjectStatus;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          project_name: string;
          deadline?: string | null;
          status: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string;
          project_name?: string;
          deadline?: string | null;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      manufacturing_process_steps: TableDefinition<
        {
          id: string;
          product_id: string;
          sequence_number: number;
          step_name: string;
          workstation: string | null;
          instructions: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          product_id: string;
          sequence_number: number;
          step_name: string;
          workstation?: string | null;
          instructions: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          product_id?: string;
          sequence_number?: number;
          step_name?: string;
          workstation?: string | null;
          instructions?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      compliance_records: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string;
          document_id: string | null;
          compliance_name: string;
          authority: string | null;
          status: ComplianceStatus;
          due_date: string | null;
          validated_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          document_id?: string | null;
          compliance_name: string;
          authority?: string | null;
          status?: ComplianceStatus;
          due_date?: string | null;
          validated_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string;
          document_id?: string | null;
          compliance_name?: string;
          authority?: string | null;
          status?: ComplianceStatus;
          due_date?: string | null;
          validated_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      product_risks: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string;
          risk_title: string;
          description: string;
          severity: QualitySeverity;
          status: RiskStatus;
          mitigation_plan: string | null;
          owner_name: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          risk_title: string;
          description: string;
          severity?: QualitySeverity;
          status?: RiskStatus;
          mitigation_plan?: string | null;
          owner_name?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string;
          risk_title?: string;
          description?: string;
          severity?: QualitySeverity;
          status?: RiskStatus;
          mitigation_plan?: string | null;
          owner_name?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      customer_feedback: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string;
          customer_name: string;
          channel: FeedbackChannel;
          rating: number | null;
          feedback_text: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id: string;
          customer_name: string;
          channel?: FeedbackChannel;
          rating?: number | null;
          feedback_text: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string;
          customer_name?: string;
          channel?: FeedbackChannel;
          rating?: number | null;
          feedback_text?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      notifications: TableDefinition<
        {
          id: string;
          user_id: string;
          product_id: string | null;
          title: string;
          message: string;
          level: NotificationLevel;
          related_path: string | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          product_id?: string | null;
          title: string;
          message: string;
          level?: NotificationLevel;
          related_path?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          product_id?: string | null;
          title?: string;
          message?: string;
          level?: NotificationLevel;
          related_path?: string | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Enums: {
      lifecycle_stage: LifecycleStage;
      document_type: DocumentType;
      supplier_status: SupplierStatus;
      change_request_status: ChangeRequestStatus;
      approval_status: ApprovalStatus;
      quality_severity: QualitySeverity;
      quality_status: QualityStatus;
      project_status: ProjectStatus;
      component_type: ComponentType;
      compliance_status: ComplianceStatus;
      risk_status: RiskStatus;
      feedback_channel: FeedbackChannel;
      notification_level: NotificationLevel;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
