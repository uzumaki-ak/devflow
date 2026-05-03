"use client";

// src/components/dashboard/MetricGrid.tsx
// lays out all 5 metric cards in a responsive grid
// knows the formatting rules for each metric type

import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatDays, formatPercent } from "@/lib/utils";
import type { DeveloperMetrics, MetricKey } from "@/types";
import type { MetricStatus, MetricWithTrend } from "@/types";

interface MetricGridProps {
  metrics: DeveloperMetrics;
  trends: Record<MetricKey, MetricWithTrend>;
  statuses: Record<MetricKey, MetricStatus>;
  flaggedMetrics: MetricKey[];
}

// metadata for each metric — label, description, formatter
const METRIC_META: Record<
  MetricKey,
  { label: string; description: string; format: (v: number) => string }
> = {
  leadTime: {
    label: "Lead Time",
    description: "Avg days from PR open → successful production deploy",
    format: formatDays,
  },
  cycleTime: {
    label: "Cycle Time",
    description: "Avg days from issue In Progress → Done",
    format: formatDays,
  },
  bugRate: {
    label: "Bug Rate",
    description: "Production bugs found ÷ issues completed × 100",
    format: formatPercent,
  },
  deployFrequency: {
    label: "Deploy Frequency",
    description: "Successful production deployments this month",
    format: (v) => `${v}`,
  },
  prThroughput: {
    label: "PR Throughput",
    description: "Merged pull requests this month",
    format: (v) => `${v}`,
  },
};

const METRIC_ORDER: MetricKey[] = [
  "leadTime",
  "cycleTime",
  "bugRate",
  "deployFrequency",
  "prThroughput",
];

export function MetricGrid({
  metrics,
  trends,
  statuses,
  flaggedMetrics,
}: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {METRIC_ORDER.map((key) => {
        const meta = METRIC_META[key];
        const value = metrics[key];
        return (
          <div key={key} className="h-full">
            <MetricCard
              metricKey={key}
              label={meta.label}
              value={meta.format(value)}
              description={meta.description}
              status={statuses[key]}
              trend={trends[key]}
              highlighted={flaggedMetrics.includes(key)}
            />
          </div>
        );
      })}
    </div>
  );
}
