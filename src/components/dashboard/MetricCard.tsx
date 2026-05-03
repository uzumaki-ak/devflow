"use client";

// src/components/dashboard/MetricCard.tsx
// shows a single metric — value, label, status badge, trend arrow
// this is the most reused component in the whole app

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, deltaSign, round1 } from "@/lib/utils";
import { MetricRuleTooltip } from "@/components/shared/MetricRuleTooltip";
import type { MetricStatus, MetricWithTrend } from "@/types";
import type { MetricKey } from "@/types";

interface MetricCardProps {
  metricKey: MetricKey;
  label: string;
  value: string; // already formatted (e.g., "2.5d" or "12.3%")
  description: string; // short definition shown on hover/below
  status: MetricStatus;
  trend: MetricWithTrend;
  highlighted?: boolean; // flag most critical metric
}

// status → color mapping
const statusStyles = {
  healthy: {
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    bar: "bg-emerald-500",
    border: "border-l-emerald-500",
  },
  warning: {
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    bar: "bg-amber-500",
    border: "border-l-amber-500",
  },
  critical: {
    badge: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    bar: "bg-rose-500",
    border: "border-l-rose-500",
  },
};

export function MetricCard({
  metricKey,
  label,
  value,
  description,
  status,
  trend,
  highlighted = false,
}: MetricCardProps) {
  const styles = statusStyles[status.status];

  const TrendIcon =
    trend.trend === "up"
      ? TrendingUp
      : trend.trend === "down"
      ? TrendingDown
      : Minus;

  // trend color: green if positive for the user, red if negative
  const trendColor = trend.isPositive
    ? "text-emerald-500"
    : trend.trend === "flat"
    ? "text-muted-foreground"
    : "text-rose-500";

  return (
    <div
      className={cn(
        "relative grid h-full min-h-[230px] grid-rows-[auto_auto_1fr_auto] gap-4",
        "border border-border border-l-2 border-l-transparent bg-card p-5 sm:p-6",
        "hover:border-foreground/35 transition-colors duration-200",
        highlighted && styles.border
      )}
    >
      {/* top row: label + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-label uppercase tracking-[0.16em] text-muted-foreground">
          {label}
          <MetricRuleTooltip metricKey={metricKey} />
        </span>
        <span
          className={cn(
            "text-[10px] font-label uppercase tracking-[0.14em] px-2 py-0.5 border",
            styles.badge
          )}
        >
          {status.label}
        </span>
      </div>

      {/* big metric number */}
      <div className="font-display text-[2.35rem] font-bold leading-none tracking-[-0.02em] text-foreground tabular-nums">
        {value}
      </div>

      {/* description */}
      <p className="text-xs font-body text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* trend row */}
      <div className={cn("flex items-center gap-1.5 text-xs font-data", trendColor)}>
        <TrendIcon size={12} strokeWidth={2} />
        <span>
          {deltaSign(trend.delta)} vs last month
          {trend.deltaPercent !== 0 && (
            <span className="opacity-60 ml-1">({deltaSign(round1(trend.deltaPercent))}%)</span>
          )}
        </span>
      </div>

      {/* thin colored bottom bar indicating status */}
      <div
        className={cn("absolute bottom-0 left-0 right-0 h-0.5 opacity-40", styles.bar)}
      />
    </div>
  );
}
