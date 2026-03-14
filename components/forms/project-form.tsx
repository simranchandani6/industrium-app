"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { UiDatePicker } from "@/components/forms/ui-date-picker";
import { UiSelect } from "@/components/forms/ui-select";
import { projectStatusOptions } from "@/lib/constants";

type ProjectFormProps = {
  productId: string;
};

export function ProjectForm({ productId }: ProjectFormProps) {
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
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          projectName: formData.get("projectName"),
          deadline: formData.get("deadline") || null,
          status: formData.get("status"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to create project milestone.");
      }

      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create project milestone.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
      <label className="block lg:col-span-2">
        <span className="mb-2 block text-sm text-steel">Milestone name</span>
        <input
          required
          name="projectName"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
          placeholder="EVT readiness review"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Deadline</span>
        <UiDatePicker
          name="deadline"
          placeholder="Select a deadline"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Status</span>
        <UiSelect
          name="status"
          defaultValue="design"
          options={projectStatusOptions}
        />
      </label>
      <div className="flex items-end justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add milestone"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-3 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
