"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, RefreshCw, User } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";
import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { InterpretationPanel } from "@/components/dashboard/InterpretationPanel";
import { NextStepsPanel } from "@/components/dashboard/NextStepsPanel";
import { DeveloperSelector } from "@/components/dashboard/DeveloperSelector";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  InterpretationSkeleton,
  MetricCardSkeleton,
} from "@/components/layout/Skeleton";
import { cn, formatPeriod } from "@/lib/utils";
import type { Developer } from "@/types";

const roleBadge: Record<string, string> = {
  junior: "Junior Engineer",
  mid: "Software Engineer",
  senior: "Senior Engineer",
  lead: "Tech Lead",
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDev, setSelectedDev] = useState(searchParams.get("dev") ?? "dev_001");
  const [period, setPeriod] = useState(searchParams.get("period") ?? "2026-05");
  const [developers, setDevelopers] = useState<Developer[]>([]);

  useEffect(() => {
    fetch("/api/developers")
      .then((r) => r.json())
      .then(setDevelopers)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ dev: selectedDev, period });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedDev, period, router]);

  const { data, loading, error, refetch } = useMetrics(selectedDev, period);

  return (
    <div className="animate-fade-in flex flex-col gap-9">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-xs font-label uppercase tracking-[0.16em] text-muted-foreground">
            Individual Contributor
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-5xl">
            {data?.developer.name ?? "Developer Dashboard"}
          </h1>
          {data && (
            <p className="mt-2 text-sm font-data text-muted-foreground">
              <span className="font-accent text-lg italic text-foreground/90">
                {roleBadge[data.developer.role] ?? data.developer.role}
              </span>
              <span className="mx-2 text-muted-foreground/60">/</span>
              {data.developer.team} Team
              <span className="mx-2 text-muted-foreground/60">/</span>
              {formatPeriod(period)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {developers.length > 0 && (
            <DeveloperSelector
              developers={developers}
              selectedId={selectedDev}
              onChange={setSelectedDev}
            />
          )}
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
          <button
            onClick={refetch}
            className="ml-auto text-xs font-label uppercase tracking-[0.12em] text-rose-500"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="h-8 w-56 animate-pulse bg-muted/40" />
      ) : (
        data && <StatusBadge status={data.overallStatus} flagCount={data.flaggedMetrics.length} />
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        data && (
          <MetricGrid
            metrics={data.metrics}
            trends={data.trends}
            statuses={data.statuses}
            flaggedMetrics={data.flaggedMetrics}
          />
        )
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-8 pt-1 lg:grid-cols-2">
          <InterpretationSkeleton />
          <InterpretationSkeleton />
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 gap-9 pt-1 lg:grid-cols-2 lg:gap-12">
            <div className="border-t border-border pt-6">
              <InterpretationPanel
                interpretation={data.interpretation}
                overallStatus={data.overallStatus}
              />
            </div>
            <div className="border-t border-border pt-6">
              <NextStepsPanel steps={data.interpretation.nextSteps} />
            </div>
          </div>
        )
      )}

      {data && !loading && (
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <div className="flex h-9 w-9 items-center justify-center border border-border bg-muted/20">
            <User size={14} className="text-foreground/80" />
          </div>
          <div>
            <p className="text-xs font-data text-muted-foreground">{data.developer.email}</p>
            <p className="mt-0.5 text-[11px] font-label uppercase tracking-[0.1em] text-muted-foreground/70">
              Based on Jira issues, PRs, CI/CD deployments, and bug reports for{" "}
              {formatPeriod(period)}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
