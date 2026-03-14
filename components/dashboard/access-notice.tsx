import type { ReactNode } from "react";

type AccessNoticeProps = {
  title: string;
  body: string;
  detail?: ReactNode;
};

export function AccessNotice({ title, body, detail }: AccessNoticeProps) {
  return (
    <div className="rounded-[22px] border border-dashed border-ink/15 bg-surface px-5 py-6 text-sm text-steel">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 leading-6">{body}</p>
      {detail ? <div className="mt-3 text-xs uppercase tracking-[0.18em] text-teal">{detail}</div> : null}
    </div>
  );
}
