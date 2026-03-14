"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

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
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-teal"
      >
        {changeRequestStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
