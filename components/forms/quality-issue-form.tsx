"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

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

    const formData = new FormData(event.currentTarget);

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

      event.currentTarget.reset();
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
        <select
          required
          name="productId"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          defaultValue=""
        >
          <option value="" disabled>
            Select a product
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.product_name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Severity</span>
        <select
          name="severity"
          defaultValue="medium"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {qualitySeverityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
        <select
          name="status"
          defaultValue="open"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {qualityStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
