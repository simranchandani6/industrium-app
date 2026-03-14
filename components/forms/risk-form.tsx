"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { qualitySeverityOptions, riskStatusOptions } from "@/lib/constants";

type RiskFormProps = {
  productId: string;
};

export function RiskForm({ productId }: RiskFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/risks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          riskTitle: formData.get("riskTitle"),
          description: formData.get("description"),
          severity: formData.get("severity"),
          status: formData.get("status"),
          mitigationPlan: formData.get("mitigationPlan") || null,
          ownerName: formData.get("ownerName") || null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to create risk entry.");
      }

      event.currentTarget.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create risk entry.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Risk title</span>
        <input
          required
          name="riskTitle"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Battery pack thermal margin is too low"
        />
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
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Status</span>
        <select
          name="status"
          defaultValue="identified"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {riskStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Description</span>
        <textarea
          required
          name="description"
          rows={3}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Describe the program or product risk clearly enough for mitigation planning."
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Owner</span>
        <input
          name="ownerName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Simra Chandani"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Mitigation plan</span>
        <input
          name="mitigationPlan"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Reduce charge rate and re-test enclosure"
        />
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add risk"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
