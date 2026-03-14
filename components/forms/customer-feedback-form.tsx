"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { UiSelect } from "@/components/forms/ui-select";
import { feedbackChannelOptions } from "@/lib/constants";

type CustomerFeedbackFormProps = {
  productId: string;
};

export function CustomerFeedbackForm({ productId }: CustomerFeedbackFormProps) {
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
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          customerName: formData.get("customerName"),
          channel: formData.get("channel"),
          rating: formData.get("rating") ? Number(formData.get("rating")) : null,
          feedbackText: formData.get("feedbackText"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to store customer feedback.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to store customer feedback.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Customer</span>
        <input
          required
          name="customerName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Northstar Fitness"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Channel</span>
        <UiSelect
          name="channel"
          defaultValue="email"
          options={feedbackChannelOptions}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Rating</span>
        <input
          min={1}
          max={5}
          type="number"
          name="rating"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="5"
        />
      </label>
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Feedback</span>
        <textarea
          required
          name="feedbackText"
          rows={4}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="Capture customer feedback, requests, or launch blockers."
        />
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add feedback"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-2 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
