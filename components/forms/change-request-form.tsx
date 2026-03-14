"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import type { ProductSummary } from "@/lib/types/plm";

type ChangeRequestFormProps = {
  products: ProductSummary[];
};

export function ChangeRequestForm({ products }: ChangeRequestFormProps) {
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
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: formData.get("productId"),
          title: formData.get("title"),
          description: formData.get("description"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to create change request.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create change request.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Product</span>
        <select
          required
          name="productId"
          defaultValue=""
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
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
        <span className="mb-2 block text-sm text-steel">Change title</span>
        <input
          required
          name="title"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Increase battery capacity to 500mAh"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Engineering rationale</span>
        <textarea
          required
          name="description"
          rows={4}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Capture the design issue, expected impact, and downstream validation plan."
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Submit change request"}
      </button>
      {errorMessage ? <p className="text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
