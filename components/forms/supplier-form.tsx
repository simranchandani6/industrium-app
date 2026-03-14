"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { supplierStatusOptions } from "@/lib/constants";

export function SupplierForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierName: formData.get("supplierName"),
          contactEmail: formData.get("contactEmail"),
          country: formData.get("country"),
          status: formData.get("status"),
          performanceScore: Number(formData.get("performanceScore")),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to create supplier.");
      }

      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create supplier.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Supplier name</span>
        <input
          required
          name="supplierName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Alpha Components Ltd"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Contact email</span>
        <input
          required
          type="email"
          name="contactEmail"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="procurement@supplier.com"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Country</span>
        <input
          required
          name="country"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Japan"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Status</span>
        <select
          name="status"
          defaultValue="active"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {supplierStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Performance score</span>
        <input
          min={0}
          max={100}
          step="0.1"
          type="number"
          name="performanceScore"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="92.5"
        />
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add supplier"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
