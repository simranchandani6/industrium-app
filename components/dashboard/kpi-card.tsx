import { ArrowUpRight } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string | number;
  detail: string;
};

export function KpiCard({ label, value, detail }: KpiCardProps) {
  return (
    <div className="rounded-[24px] border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-steel">{label}</p>
        <ArrowUpRight className="size-4 text-teal" />
      </div>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-3 text-sm leading-6 text-steel">{detail}</p>
    </div>
  );
}

