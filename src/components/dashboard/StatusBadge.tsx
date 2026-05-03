// src/components/dashboard/StatusBadge.tsx
// big status pill at the top of the dashboard
// the first thing your eye goes to — should be unmissable

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "healthy" | "warning" | "critical";
  flagCount: number;
}

const config = {
  healthy: {
    label: "All Systems Healthy",
    classes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/40",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Needs Attention",
    classes: "bg-amber-500/10 text-amber-500 border-amber-500/40",
    dot: "bg-amber-500 animate-pulse",
  },
  critical: {
    label: "Action Required",
    classes: "bg-rose-500/10 text-rose-500 border-rose-500/40",
    dot: "bg-rose-500 animate-pulse",
  },
};

export function StatusBadge({ status, flagCount }: StatusBadgeProps) {
  const c = config[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-label uppercase tracking-[0.14em]",
        c.classes
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
      <span>{c.label}</span>
      {flagCount > 0 && (
        <span className="opacity-60">
          · {flagCount} flag{flagCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
