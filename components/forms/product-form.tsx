"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { lifecycleStageOptions } from "@/lib/constants";

export function ProductForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: formData.get("productName"),
          productSku: formData.get("productSku"),
          productCategory: formData.get("productCategory"),
          description: formData.get("description"),
          lifecycleStage: formData.get("lifecycleStage"),
          versionCode: formData.get("versionCode"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to create product.");
      }

      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create product.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Product name</span>
        <input
          required
          name="productName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="e.g. Hydraulic Valve Assembly"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">SKU</span>
        <input
          required
          name="productSku"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="e.g. HVA-2001"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Category</span>
        <input
          required
          name="productCategory"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="e.g. Automotive, Aerospace, Medical"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Current version</span>
        <input
          required
          name="versionCode"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="v1.0"
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Description</span>
        <textarea
          required
          name="description"
          rows={4}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Describe the product, design intent, and current milestone."
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Lifecycle stage</span>
        <select
          name="lifecycleStage"
          defaultValue="design"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {lifecycleStageOptions.map((option) => (
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
          className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
        >
          {isPending ? "Creating..." : "Create product"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
