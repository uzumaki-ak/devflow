"use client";

import { CircleHelp } from "lucide-react";
import { METRIC_RULES } from "@/lib/metric-rules";
import type { MetricKey } from "@/types";

interface MetricRuleTooltipProps {
  metricKey: MetricKey;
  align?: "left" | "right";
}

export function MetricRuleTooltip({
  metricKey,
  align = "right",
}: MetricRuleTooltipProps) {
  const rule = METRIC_RULES[metricKey];
  const title = `${rule.label}: ${rule.formula}. ${rule.thresholds}`;

  return (
    <span className="relative inline-flex group/rule">
      <button
        type="button"
        aria-label={`Threshold rules for ${rule.label}`}
        title={title}
        className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground/70 transition-colors hover:text-foreground focus:outline-none focus:text-foreground"
      >
        <CircleHelp size={12} strokeWidth={1.8} />
      </button>
      <span
        className={[
          "pointer-events-none absolute z-30 hidden min-w-[220px] max-w-[280px] border border-border bg-card p-2.5 text-left opacity-0 shadow-sm transition-opacity duration-150 sm:block",
          align === "left" ? "right-0 top-5" : "left-0 top-5",
          "group-hover/rule:opacity-100 group-focus-within/rule:opacity-100",
        ].join(" ")}
        role="tooltip"
      >
        <span className="block text-[10px] font-label uppercase tracking-[0.14em] text-muted-foreground">
          Metric Logic
        </span>
        <span className="mt-1 block text-xs font-body text-foreground/90">{rule.formula}</span>
        <span className="mt-1.5 block text-[11px] font-data text-muted-foreground">
          {rule.thresholds}
        </span>
      </span>
    </span>
  );
}
