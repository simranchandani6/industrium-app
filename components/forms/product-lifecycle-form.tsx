"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { UiSelect } from "@/components/forms/ui-select";
import { lifecycleStageOptions } from "@/lib/constants";
import type { LifecycleStage } from "@/lib/types/database";

type ProductLifecycleFormProps = {
  productId: string;
  currentStage: LifecycleStage;
};

export function ProductLifecycleForm({
  productId,
  currentStage,
}: ProductLifecycleFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          lifecycleStage: formData.get("lifecycleStage"),
        }),
      });

      if (!response.ok) {
        throw new Error("We could not update the lifecycle stage right now.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not update the lifecycle stage right now.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <UiSelect
          name="lifecycleStage"
          defaultValue={currentStage}
          options={lifecycleStageOptions}
          className="w-full"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl border border-ink/10 px-4 py-3 text-sm font-medium text-ink transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Updating..." : "Update stage"}
        </button>
      </div>
      {errorMessage ? <p className="text-sm text-signal">{errorMessage}</p> : null}
    </form>
  );
}
