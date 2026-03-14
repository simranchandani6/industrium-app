"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type ProductVersionFormProps = {
  productId: string;
};

export function ProductVersionForm({ productId }: ProductVersionFormProps) {
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
      const response = await fetch("/api/product-versions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          versionCode: formData.get("versionCode"),
          summary: formData.get("summary"),
          releasedAt: formData.get("releasedAt")
            ? new Date(String(formData.get("releasedAt"))).toISOString()
            : null,
          markAsCurrent: Boolean(formData.get("markAsCurrent")),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to create product version.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create product version.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Version code</span>
        <input
          required
          name="versionCode"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="v1.4"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Release date</span>
        <input
          name="releasedAt"
          type="date"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Configuration summary</span>
        <textarea
          required
          name="summary"
          rows={3}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Describe the delta from the previous version and why it matters."
        />
      </label>
      <label className="flex items-center gap-3 text-sm text-steel lg:col-span-2">
        <input
          type="checkbox"
          name="markAsCurrent"
          defaultChecked
          className="size-4 rounded border border-ink/20"
        />
        Set this as the current product configuration
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Create version"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
