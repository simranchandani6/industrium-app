"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { UiSelect } from "@/components/forms/ui-select";
import { qualitySeverityOptions, qualityStatusOptions } from "@/lib/constants";
import type { ProductSummary } from "@/lib/types/plm";

type QualityIssueFormProps = {
  products: ProductSummary[];
};

export function QualityIssueForm({ products }: QualityIssueFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/quality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: formData.get("productId"),
          issueTitle: formData.get("issueTitle"),
          description: formData.get("description"),
          severity: formData.get("severity"),
          status: formData.get("status"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to create quality issue.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create quality issue.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Product</span>
        <UiSelect
          required
          name="productId"
          defaultValue=""
          placeholder="Select a product"
          options={products.map((product) => ({
            value: product.id,
            label: product.product_name,
          }))}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Severity</span>
        <UiSelect
          name="severity"
          defaultValue="medium"
          options={qualitySeverityOptions}
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Issue title</span>
        <input
          required
          name="issueTitle"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Battery overheating during 2C charge cycle"
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Description</span>
        <textarea
          required
          name="description"
          rows={4}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Describe the test condition, failure mode, and containment action."
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Status</span>
        <UiSelect
          name="status"
          defaultValue="open"
          options={qualityStatusOptions}
        />
      </label>
      <div className="flex items-end justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Log issue"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
