"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { complianceStatusOptions } from "@/lib/constants";
import type { DocumentWithAccessUrl } from "@/lib/types/plm";

type ComplianceRecordFormProps = {
  productId: string;
  documents: DocumentWithAccessUrl[];
};

export function ComplianceRecordForm({
  productId,
  documents,
}: ComplianceRecordFormProps) {
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
      const response = await fetch("/api/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          documentId: formData.get("documentId") || null,
          complianceName: formData.get("complianceName"),
          authority: formData.get("authority") || null,
          status: formData.get("status"),
          dueDate: formData.get("dueDate") || null,
          notes: formData.get("notes") || null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to save compliance record.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save compliance record.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Compliance item</span>
        <input
          required
          name="complianceName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="UL battery review"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Authority</span>
        <input
          name="authority"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="UL"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Status</span>
        <select
          name="status"
          defaultValue="pending"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {complianceStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Due date</span>
        <input
          name="dueDate"
          type="date"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Supporting document</span>
        <select
          name="documentId"
          defaultValue=""
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          <option value="">No document linked yet</option>
          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.document_name}
            </option>
          ))}
        </select>
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Capture evidence gaps, expiry conditions, or review notes."
        />
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add compliance record"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
