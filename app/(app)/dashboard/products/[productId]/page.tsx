import { notFound } from "next/navigation";

import { BomTree } from "@/components/dashboard/bom-tree";
import { Panel } from "@/components/dashboard/panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ChangeRequestStatusForm } from "@/components/forms/change-request-status-form";
import { ComplianceRecordForm } from "@/components/forms/compliance-record-form";
import { ComponentForm } from "@/components/forms/component-form";
import { CustomerFeedbackForm } from "@/components/forms/customer-feedback-form";
import { ProcessStepForm } from "@/components/forms/process-step-form";
import { ProductVersionForm } from "@/components/forms/product-version-form";
import { ProjectForm } from "@/components/forms/project-form";
import { RiskForm } from "@/components/forms/risk-form";
import { getSessionContext } from "@/lib/data/auth";
import { getProductDetail } from "@/lib/data/products";
import { formatCurrency, formatDate } from "@/lib/utils";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const sessionContext = await getSessionContext();

  if (!sessionContext) {
    return null;
  }

  const { productId } = await params;
  const detail = await getProductDetail(
    sessionContext.supabase,
    sessionContext.profile,
    productId,
  );

  if (!detail) {
    notFound();
  }

  const totalBomCost = detail.components.reduce(
    (accumulator, component) => accumulator + Number(component.quantity) * Number(component.unit_cost),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-panel lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-teal">
              Product detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
              {detail.product.product_name}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-steel">
              {detail.product.description}
            </p>
          </div>
          <StatusBadge value={detail.product.lifecycle_stage} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="rounded-[24px] bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel">SKU</p>
            <p className="mt-2 text-lg font-semibold text-ink">{detail.product.product_sku}</p>
          </div>
          <div className="rounded-[24px] bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel">Version</p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {detail.currentVersion?.version_code ?? "Unreleased"}
            </p>
          </div>
          <div className="rounded-[24px] bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel">
              BOM cost
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">{formatCurrency(totalBomCost)}</p>
          </div>
          <div className="rounded-[24px] bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-steel">Projects</p>
            <p className="mt-2 text-lg font-semibold text-ink">{detail.projects.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Panel title="BOM visualization" eyebrow={detail.bom?.bom_version ?? "No BOM version"}>
            <BomTree nodes={detail.bomTree} />
          </Panel>

          <Panel title="Configuration history" eyebrow="Versions">
            <div className="space-y-4">
              {detail.versions.map((version) => (
                <div key={version.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{version.version_code}</p>
                      <p className="mt-1 text-sm text-steel">{version.summary}</p>
                    </div>
                    <StatusBadge value={version.is_current ? "approved" : "design"} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-steel">
                    Released {formatDate(version.released_at)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <ProductVersionForm productId={detail.product.id} />
            </div>
          </Panel>

          {detail.bom ? (
            <Panel title="Add BOM component" eyebrow="Component structure">
              <ComponentForm
                bomId={detail.bom.id}
                suppliers={detail.suppliers}
                parentComponentOptions={detail.components.map((component) => ({
                  id: component.id,
                  name: component.component_name,
                }))}
              />
            </Panel>
          ) : null}

          <Panel title="Manufacturing process plan" eyebrow="Process planning">
            <div className="space-y-3">
              {detail.processSteps.map((step) => (
                <div key={step.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {step.sequence_number}. {step.step_name}
                      </p>
                      <p className="mt-1 text-sm text-steel">
                        {step.workstation ?? "Workstation not assigned"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-steel">{step.instructions}</p>
                </div>
              ))}
              {detail.processSteps.length === 0 ? (
                <p className="text-sm text-steel">No process steps defined yet.</p>
              ) : null}
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <ProcessStepForm
                productId={detail.product.id}
                nextSequenceNumber={
                  detail.processSteps.length > 0
                    ? detail.processSteps[detail.processSteps.length - 1]!.sequence_number + 10
                    : 10
                }
              />
            </div>
          </Panel>

          <Panel title="Engineering documents" eyebrow="Storage-backed files">
            <div className="space-y-3">
              {detail.documents.map((document) => (
                <div key={document.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{document.document_name}</p>
                      <p className="mt-1 text-sm text-steel">
                        {document.document_type.replaceAll("_", " ")} • Version {document.version}
                      </p>
                    </div>
                    {document.signedUrl ? (
                      <a
                        href={document.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-teal"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-sm text-steel">Awaiting upload</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Compliance register" eyebrow="Regulatory tracking">
            <div className="space-y-3">
              {detail.complianceRecords.map((record) => (
                <div key={record.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{record.compliance_name}</p>
                      <p className="mt-1 text-sm text-steel">
                        {record.authority ?? "Authority not specified"} • Due {formatDate(record.due_date)}
                      </p>
                    </div>
                    <StatusBadge value={record.status} />
                  </div>
                  {record.notes ? (
                    <p className="mt-3 text-sm leading-6 text-steel">{record.notes}</p>
                  ) : null}
                </div>
              ))}
              {detail.complianceRecords.length === 0 ? (
                <p className="text-sm text-steel">No compliance records linked yet.</p>
              ) : null}
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <ComplianceRecordForm
                productId={detail.product.id}
                documents={detail.documents}
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Change requests" eyebrow="Workflow">
            <div className="space-y-4">
              {detail.changeRequests.map((changeRequest) => (
                <div key={changeRequest.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{changeRequest.title}</p>
                      <p className="mt-2 text-sm leading-6 text-steel">{changeRequest.description}</p>
                    </div>
                    <StatusBadge value={changeRequest.status} />
                  </div>
                  <div className="mt-4">
                    <ChangeRequestStatusForm
                      changeRequestId={changeRequest.id}
                      currentStatus={changeRequest.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Quality issues" eyebrow="Validation">
            <div className="space-y-4">
              {detail.qualityIssues.map((qualityIssue) => (
                <div key={qualityIssue.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{qualityIssue.issue_title}</p>
                      <p className="mt-2 text-sm leading-6 text-steel">{qualityIssue.description}</p>
                    </div>
                    <div className="space-x-2">
                      <StatusBadge value={qualityIssue.severity} />
                      <StatusBadge value={qualityIssue.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Projects" eyebrow="Milestones">
            <div className="space-y-3">
              {detail.projects.map((project) => (
                <div key={project.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{project.project_name}</p>
                      <p className="mt-1 text-sm text-steel">{formatDate(project.deadline)}</p>
                    </div>
                    <StatusBadge value={project.status} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <ProjectForm productId={detail.product.id} />
            </div>
          </Panel>

          <Panel title="Risk register" eyebrow="Assessment tools">
            <div className="space-y-3">
              {detail.risks.map((risk) => (
                <div key={risk.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{risk.risk_title}</p>
                      <p className="mt-2 text-sm leading-6 text-steel">{risk.description}</p>
                    </div>
                    <div className="space-x-2">
                      <StatusBadge value={risk.severity} />
                      <StatusBadge value={risk.status} />
                    </div>
                  </div>
                  {risk.mitigation_plan ? (
                    <p className="mt-3 text-sm text-steel">Mitigation: {risk.mitigation_plan}</p>
                  ) : null}
                </div>
              ))}
              {detail.risks.length === 0 ? (
                <p className="text-sm text-steel">No active risks are registered.</p>
              ) : null}
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <RiskForm productId={detail.product.id} />
            </div>
          </Panel>

          <Panel title="Customer feedback" eyebrow="Voice of customer">
            <div className="space-y-3">
              {detail.feedback.map((feedbackItem) => (
                <div key={feedbackItem.id} className="rounded-[22px] border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{feedbackItem.customer_name}</p>
                      <p className="mt-1 text-sm text-steel">
                        {feedbackItem.channel.replaceAll("_", " ")} • Rating {feedbackItem.rating ?? "n/a"}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-steel">
                      {formatDate(feedbackItem.created_at)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-steel">{feedbackItem.feedback_text}</p>
                </div>
              ))}
              {detail.feedback.length === 0 ? (
                <p className="text-sm text-steel">No customer feedback has been logged yet.</p>
              ) : null}
            </div>
            <div className="mt-5 border-t border-ink/10 pt-5">
              <CustomerFeedbackForm productId={detail.product.id} />
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
