"use client";

import { type ReactNode, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type RevealFormCardProps = {
  title: string;
  description: string;
  buttonLabel?: string;
  children: ReactNode;
  className?: string;
};

export function RevealFormCard({
  title,
  description,
  buttonLabel,
  children,
  className,
}: RevealFormCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("rounded-[22px] border border-dashed border-ink/15 bg-surface p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm text-steel">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-teal/35 hover:text-teal"
          aria-expanded={isOpen}
        >
          {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
          {buttonLabel ?? (isOpen ? "Hide form" : "Add")}
        </button>
      </div>
      {isOpen ? <div className="mt-4 border-t border-ink/10 pt-4">{children}</div> : null}
    </div>
  );
}
