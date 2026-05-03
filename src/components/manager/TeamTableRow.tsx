"use client";

import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { cn, formatDays, formatPercent } from "@/lib/utils";
import type { TeamMetricRow, MetricKey } from "@/types";

interface TeamTableRowProps {
  row: TeamMetricRow;
  period: string;
}

const statusDot = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-rose-500 animate-pulse",
};

function fmt(key: MetricKey, value: number): string {
  if (key === "leadTime" || key === "cycleTime") return formatDays(value);
  if (key === "bugRate") return formatPercent(value);
  return String(value);
}

const METRICS: MetricKey[] = [
  "leadTime",
  "cycleTime",
  "bugRate",
  "deployFrequency",
  "prThroughput",
];

export function TeamTableRow({ row, period }: TeamTableRowProps) {
  const isFlagged = (key: MetricKey) => row.flags.includes(key);

  return (
    <tr className="group border-b border-border transition-colors hover:bg-muted/20">
      <td className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className={cn("h-1.5 w-1.5 shrink-0", statusDot[row.overallStatus])} />
          <div>
            <p className="text-base font-ui font-semibold tracking-[-0.01em] text-foreground">
              {row.developer.name}
            </p>
            <p className="text-[11px] font-label uppercase tracking-[0.12em] text-muted-foreground">
              {row.developer.team} - {row.developer.role}
            </p>
          </div>
        </div>
      </td>

      {METRICS.map((key) => (
        <td key={key} className="px-4 py-4 text-center">
          <span
            className={cn(
              "text-[1.05rem] font-data tabular-nums",
              isFlagged(key) ? "font-medium text-rose-500" : "text-foreground"
            )}
          >
            {fmt(key, row.metrics[key] as number)}
            {isFlagged(key) && (
              <AlertTriangle size={10} className="ml-1 inline text-rose-500 opacity-70" />
            )}
          </span>
        </td>
      ))}

      <td className="px-4 py-4 text-right">
        <Link
          href={`/?dev=${row.developer.id}&period=${period}`}
          className="inline-flex items-center gap-1 text-[11px] font-label uppercase tracking-[0.12em] text-muted-foreground opacity-0 transition-colors hover:text-foreground group-hover:opacity-100"
        >
          View
          <ExternalLink size={10} />
        </Link>
      </td>
    </tr>
  );
}
