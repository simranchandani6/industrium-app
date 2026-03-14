"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

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

    const formData = new FormData(event.currentTarget);

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

      event.currentTarget.reset();
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
        <input
          name="deadline"
          type="date"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-steel">Status</span>
        <select
          name="status"
          defaultValue="design"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-teal"
        >
          {projectStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
          {isPending ? "Saving..." : "Add milestone"}
        </button>
      </div>
      {errorMessage ? <p className="lg:col-span-3 text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
