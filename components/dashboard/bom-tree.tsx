import { ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import type { BomNode } from "@/lib/types/plm";
import { formatCurrency } from "@/lib/utils";

type BomTreeProps = {
  nodes: BomNode[];
  depth?: number;
};

export function BomTree({ nodes, depth = 0 }: BomTreeProps) {
  if (nodes.length === 0) {
    return <p className="text-sm text-steel">No BOM components recorded yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className="rounded-[22px] border border-ink/10 bg-surface/90 p-4"
            style={{ marginLeft: `${depth * 18}px` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {depth > 0 ? <ChevronRight className="size-4 text-steel" /> : null}
                  <p className="font-medium text-ink">{node.component_name}</p>
                  <StatusBadge value={node.component_type} />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-steel">
                  {node.component_sku} • {node.manufacturer}
                </p>
              </div>
              <div className="text-right text-sm text-steel">
                <p>Qty {node.quantity}</p>
                <p>{formatCurrency(node.unit_cost)}</p>
              </div>
            </div>
          </div>
          {node.children.length > 0 ? <BomTree nodes={node.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

