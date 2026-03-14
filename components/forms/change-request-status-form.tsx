"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { UiSelect } from "@/components/forms/ui-select";
import { changeRequestStatusOptions } from "@/lib/constants";

type ChangeRequestStatusFormProps = {
  changeRequestId: string;
  currentStatus: string;
};

export function ChangeRequestStatusForm({
  changeRequestId,
  currentStatus,
}: ChangeRequestStatusFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.currentTarget);

    await fetch("/api/workflows", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        changeRequestId,
        status: formData.get("status"),
      }),
    });

    router.refresh();
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <UiSelect
        name="status"
        defaultValue={currentStatus}
        options={changeRequestStatusOptions}
        className="min-w-[180px]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-2xl border border-ink/10 px-3 py-2 text-sm text-ink transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Update"}
      </button>
    </form>
  );
}
