"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, RefreshCw, Users } from "lucide-react";
import { useTeamMetrics } from "@/hooks/useTeamMetrics";
import { TeamTableRow } from "@/components/manager/TeamTableRow";
import { TeamMetricChart } from "@/components/manager/TeamMetricChart";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { MetricRuleTooltip } from "@/components/shared/MetricRuleTooltip";
import { Skeleton } from "@/components/layout/Skeleton";
import { cn, formatDays, formatPercent, formatPeriod } from "@/lib/utils";
import type { MetricKey, TeamMetricRow } from "@/types";

const TABLE_HEADERS: Array<{ key: MetricKey; label: string }> = [
  { key: "leadTime", label: "Lead Time" },
  { key: "cycleTime", label: "Cycle Time" },
  { key: "bugRate", label: "Bug Rate" },
  { key: "deployFrequency", label: "Deploys" },
  { key: "prThroughput", label: "PRs" },
];

const chartFormatters: Record<MetricKey, (v: number) => string> = {
  leadTime: formatDays,
  cycleTime: formatDays,
  bugRate: formatPercent,
  deployFrequency: (v) => String(v),
  prThroughput: (v) => String(v),
};

const RISK_PRIORITY: MetricKey[] = [
  "bugRate",
  "cycleTime",
  "leadTime",
  "deployFrequency",
  "prThroughput",
];

function riskScore(row: TeamMetricRow): number {
  const statusWeight =
    row.overallStatus === "critical" ? 100 : row.overallStatus === "warning" ? 60 : 20;
  return statusWeight + row.flags.length * 12 + row.metrics.bugRate;
}

function formatMetricValue(row: TeamMetricRow, key: MetricKey): string {
  if (key === "leadTime" || key === "cycleTime") return formatDays(row.metrics[key]);
  if (key === "bugRate") return formatPercent(row.metrics[key]);
  return String(row.metrics[key]);
}

function metricMessage(key: MetricKey): string {
  if (key === "bugRate") return "bug rate is elevated";
  if (key === "cycleTime") return "cycle time is slower than target";
  if (key === "leadTime") return "lead time is above target";
  if (key === "deployFrequency") return "deploy frequency is below target";
  return "PR throughput is below target";
}

function buildRiskReason(row: TeamMetricRow): string {
  const prioritizedFlags = RISK_PRIORITY.filter((key) => row.flags.includes(key));
  const [first, second] = prioritizedFlags;

  if (!first) return "No active warning flags for this period.";
  if (!second) return `${metricMessage(first)} (${formatMetricValue(row, first)}).`;

  return `${metricMessage(first)} (${formatMetricValue(row, first)}) and ${metricMessage(second)} (${formatMetricValue(row, second)}).`;
}

export default function ManagerPage() {
  const [period, setPeriod] = useState("2026-05");
  const { data, loading, error, refetch } = useTeamMetrics(period);

  const counts = {
    critical: data?.team.filter((r) => r.overallStatus === "critical").length ?? 0,
    warning: data?.team.filter((r) => r.overallStatus === "warning").length ?? 0,
    healthy: data?.team.filter((r) => r.overallStatus === "healthy").length ?? 0,
  };
  const atRisk =
    data?.team
      .filter((row) => row.flags.length > 0)
      .sort((a, b) => riskScore(b) - riskScore(a))
      .slice(0, 2) ?? [];

  return (
    <div className="animate-fade-in flex flex-col gap-9">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-label uppercase tracking-[0.16em] text-muted-foreground">
            Manager View
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-5xl">
            Team Overview
          </h1>
          <p className="mt-2 text-sm font-data text-muted-foreground">
            {formatPeriod(period)} <span className="mx-2 text-muted-foreground/60">/</span> All
            Developers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PeriodSelector selected={period} onChange={setPeriod} />
          <button
            onClick={refetch}
            disabled={loading}
            className={cn(
              "h-10 w-10 border border-border text-muted-foreground transition-colors",
              "hover:border-foreground hover:bg-foreground hover:text-background",
              loading && "cursor-not-allowed opacity-50"
            )}
            aria-label="Refresh data"
          >
            <RefreshCw size={14} className={cn("mx-auto", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 border border-rose-500/40 bg-rose-500/5 p-4">
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <p className="text-sm font-body text-rose-500">{error}</p>
        </div>
      )}

      {!loading && data && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 border border-rose-500/35 bg-rose-500/10 px-3 py-1.5 text-xs font-label uppercase tracking-[0.12em] text-rose-500">
            <span className="h-1.5 w-1.5 animate-pulse bg-rose-500" />
            {counts.critical} Critical
          </div>
          <div className="flex items-center gap-2 border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-xs font-label uppercase tracking-[0.12em] text-amber-500">
            <span className="h-1.5 w-1.5 bg-amber-500" />
            {counts.warning} Warning
          </div>
          <div className="flex items-center gap-2 border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-label uppercase tracking-[0.12em] text-emerald-500">
            <span className="h-1.5 w-1.5 bg-emerald-500" />
            {counts.healthy} Healthy
          </div>
        </div>
      )}

      {!loading && atRisk.length > 0 && (
        <div className="border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-xs font-label uppercase tracking-[0.16em] text-muted-foreground">
              Who Needs Help First
            </h2>
            <span className="text-[10px] font-label uppercase tracking-[0.14em] text-muted-foreground/70">
              Prioritized by active risk severity
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {atRisk.map((row) => (
              <Link
                key={row.developer.id}
                href={`/?dev=${row.developer.id}&period=${period}`}
                className="group border border-border p-3 transition-colors hover:border-foreground/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-ui font-semibold tracking-[-0.01em] text-foreground">
                    {row.developer.name}
                  </p>
                  <span className="text-[10px] font-label uppercase tracking-[0.12em] text-muted-foreground">
                    {row.flags.length} flag{row.flags.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-1 text-xs font-body text-muted-foreground">{buildRiskReason(row)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        data && (
          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 py-3 text-left text-xs font-label font-normal uppercase tracking-[0.16em] text-muted-foreground">
                    Developer
                  </th>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h.key}
                      className="px-4 py-3 text-center text-xs font-label font-normal uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      <span className="inline-flex items-center justify-center gap-1.5">
                        {h.label}
                        <MetricRuleTooltip metricKey={h.key} align="left" />
                      </span>
                    </th>
                  ))}
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {data.team.map((row) => (
                  <TeamTableRow key={row.developer.id} row={row} period={period} />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <div className="border-t border-border pt-8">
        <div className="mb-6 flex items-center gap-2">
          <Users size={14} className="text-accent" strokeWidth={1.5} />
          <h2 className="text-xs font-label uppercase tracking-[0.16em] text-muted-foreground">
            Metric Breakdown by Developer
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : (
          data && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TABLE_HEADERS.map((h) => (
                <TeamMetricChart
                  key={h.key}
                  data={data.team}
                  metricKey={h.key}
                  label={h.label}
                  formatter={chartFormatters[h.key]}
                />
              ))}
            </div>
          )
        )}
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-[11px] font-label uppercase tracking-[0.12em] text-muted-foreground/70">
          Red values indicate warning or critical status. Click a developer row to open the IC
          dashboard.
        </p>
      </div>
    </div>
  );
}
