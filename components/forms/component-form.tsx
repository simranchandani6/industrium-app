"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { componentTypeOptions } from "@/lib/constants";
import type { SupplierRecord } from "@/lib/types/plm";

type ComponentFormProps = {
  bomId: string;
  suppliers: SupplierRecord[];
  parentComponentOptions: { id: string; name: string }[];
};

export function ComponentForm({
  bomId,
  suppliers,
  parentComponentOptions,
}: ComponentFormProps) {
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
      const response = await fetch("/api/boms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bomId,
          parentComponentId: formData.get("parentComponentId") || null,
          supplierId: formData.get("supplierId") || null,
          componentName: formData.get("componentName"),
          componentSku: formData.get("componentSku"),
          componentType: formData.get("componentType"),
          manufacturer: formData.get("manufacturer"),
          quantity: Number(formData.get("quantity")),
          unitCost: Number(formData.get("unitCost")),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to add component.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add component.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Component name</span>
        <input
          required
          name="componentName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="OLED Display"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Component SKU</span>
        <input
          required
          name="componentSku"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="CMP-OLED-12"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Component type</span>
        <select
          name="componentType"
          defaultValue="module"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {componentTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Manufacturer</span>
        <input
          required
          name="manufacturer"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Alpha Components Ltd"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Quantity</span>
        <input
          required
          min={0.01}
          step="0.01"
          type="number"
          name="quantity"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="1"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Unit cost (USD)</span>
        <input
          required
          min={0}
          step="0.01"
          type="number"
          name="unitCost"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="4.95"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Supplier</span>
        <select
          name="supplierId"
          defaultValue=""
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          <option value="">No supplier linked</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplier_name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Parent component</span>
        <select
          name="parentComponentId"
          defaultValue=""
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          <option value="">Top-level component</option>
          {parentComponentOptions.map((component) => (
            <option key={component.id} value={component.id}>
              {component.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add BOM component"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
