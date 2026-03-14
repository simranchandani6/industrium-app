import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  value: string;
};

const styleMap: Record<string, string> = {
  preferred: "bg-teal/10 text-teal",
  active: "bg-teal/10 text-teal",
  approved: "bg-teal/10 text-teal",
  implemented: "bg-teal/10 text-teal",
  resolved: "bg-teal/10 text-teal",
  valid: "bg-teal/10 text-teal",
  mitigated: "bg-teal/10 text-teal",
  success: "bg-teal/10 text-teal",
  closed: "bg-ink/10 text-ink",
  testing: "bg-accent/15 text-accentDark",
  prototype: "bg-accent/15 text-accentDark",
  design: "bg-accent/15 text-accentDark",
  concept: "bg-accent/15 text-accentDark",
  manufacturing: "bg-accent/15 text-accentDark",
  launch: "bg-accent/15 text-accentDark",
  sustaining: "bg-accent/15 text-accentDark",
  submitted: "bg-signal/12 text-signal",
  in_review: "bg-signal/12 text-signal",
  investigating: "bg-signal/12 text-signal",
  open: "bg-signal/12 text-signal",
  critical: "bg-signal/12 text-signal",
  high: "bg-signal/12 text-signal",
  needs_review: "bg-signal/12 text-signal",
  monitoring: "bg-signal/12 text-signal",
  warning: "bg-signal/12 text-signal",
  rejected: "bg-ink/10 text-ink",
  inactive: "bg-ink/10 text-ink",
  onboarding: "bg-ink/10 text-ink",
  pending: "bg-accent/15 text-accentDark",
  identified: "bg-accent/15 text-accentDark",
  info: "bg-ink/10 text-ink",
  expired: "bg-ink/10 text-ink",
};

export function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize tracking-wide",
        styleMap[value] ?? "bg-ink/10 text-ink",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
