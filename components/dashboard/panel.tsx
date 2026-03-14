import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = {
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, eyebrow, actions, children, className }: PanelProps) {
  return (
    <section className={cn("relative overflow-visible rounded-[28px] border border-ink/10 bg-panel p-6 shadow-panel", className)}>
      {(title || eyebrow || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-teal">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2> : null}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
