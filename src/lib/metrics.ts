// src/lib/metrics.ts
// all the metric math lives here — pure functions, easy to test
// follows the assignment definitions exactly (not DORA definitions)

import type {
  Developer,
  Issue,
  PullRequest,
  Deployment,
  Bug,
  DeveloperMetrics,
  MetricStatus,
  MetricWithTrend,
  MetricKey,
} from "@/types";
import { daysBetween, round1, prevPeriod } from "@/lib/utils";

// ─── Raw Calculation Helpers ─────────────────────────────────────────────────

// lead time: avg days from PR.opened_at → first successful deploy for that PR
// only counts PRs that actually got deployed this month
export function calcLeadTime(
  prs: PullRequest[],
  deployments: Deployment[],
  devId: string,
  period: string
): number {
  const devPrs = prs.filter(
    (pr) => pr.developer_id === devId && pr.merged_at !== null && pr.month === period
  );

  const times: number[] = [];

  for (const pr of devPrs) {
    // find the first successful deployment for this PR
    const firstDeploy = deployments
      .filter((d) => d.pr_id === pr.id && d.success)
      .sort(
        (a, b) => new Date(a.deployed_at).getTime() - new Date(b.deployed_at).getTime()
      )[0];

    if (firstDeploy) {
      times.push(daysBetween(pr.opened_at, firstDeploy.deployed_at));
    }
  }

  if (times.length === 0) return 0;
  return round1(times.reduce((a, b) => a + b, 0) / times.length);
}

// cycle time: avg days from issue.started_at → issue.completed_at
export function calcCycleTime(
  issues: Issue[],
  devId: string,
  period: string
): number {
  const completed = issues.filter(
    (i) =>
      i.developer_id === devId &&
      i.status === "done" &&
      i.started_at !== null &&
      i.completed_at !== null &&
      i.month === period
  );

  if (completed.length === 0) return 0;

  const times = completed.map((i) =>
    daysBetween(i.started_at!, i.completed_at!)
  );

  return round1(times.reduce((a, b) => a + b, 0) / times.length);
}

// bug rate: (bugs found this month / issues completed this month) * 100
export function calcBugRate(
  bugs: Bug[],
  issues: Issue[],
  devId: string,
  period: string
): number {
  const bugsThisMonth = bugs.filter(
    (b) => b.developer_id === devId && b.month === period
  ).length;

  const issuesDone = issues.filter(
    (i) =>
      i.developer_id === devId &&
      i.status === "done" &&
      i.month === period
  ).length;

  if (issuesDone === 0) return 0;
  return round1((bugsThisMonth / issuesDone) * 100);
}

// deploy frequency: count of successful deployments this month
export function calcDeployFrequency(
  deployments: Deployment[],
  devId: string,
  period: string
): number {
  return deployments.filter(
    (d) => d.developer_id === devId && d.success && d.month === period
  ).length;
}

// pr throughput: count of merged PRs this month
export function calcPRThroughput(
  prs: PullRequest[],
  devId: string,
  period: string
): number {
  return prs.filter(
    (pr) => pr.developer_id === devId && pr.merged_at !== null && pr.month === period
  ).length;
}

// ─── Full Metrics Object ─────────────────────────────────────────────────────

// calcDeveloperMetrics — builds the full metrics object for one dev + period
export function calcDeveloperMetrics(
  developer: Developer,
  period: string,
  issues: Issue[],
  prs: PullRequest[],
  deployments: Deployment[],
  bugs: Bug[]
): DeveloperMetrics {
  return {
    developer,
    period,
    leadTime: calcLeadTime(prs, deployments, developer.id, period),
    cycleTime: calcCycleTime(issues, developer.id, period),
    bugRate: calcBugRate(bugs, issues, developer.id, period),
    deployFrequency: calcDeployFrequency(deployments, developer.id, period),
    prThroughput: calcPRThroughput(prs, developer.id, period),
  };
}

// ─── Status Thresholds ───────────────────────────────────────────────────────
// these are opinionated thresholds — in a real product, these would be
// configurable per team or pulled from historical baselines

const THRESHOLDS: Record<
  MetricKey,
  { warning: number; critical: number; higherIsBetter: boolean }
> = {
  leadTime: { warning: 4, critical: 7, higherIsBetter: false },
  cycleTime: { warning: 3, critical: 6, higherIsBetter: false },
  bugRate: { warning: 10, critical: 20, higherIsBetter: false },
  deployFrequency: { warning: 4, critical: 2, higherIsBetter: true },
  prThroughput: { warning: 5, critical: 3, higherIsBetter: true },
};

// getMetricStatus — returns health status for a single metric value
export function getMetricStatus(key: MetricKey, value: number): MetricStatus {
  const t = THRESHOLDS[key];

  if (t.higherIsBetter) {
    if (value >= t.warning) return { status: "healthy", label: "Healthy" };
    if (value >= t.critical) return { status: "warning", label: "Warning" };
    return { status: "critical", label: "Critical" };
  } else {
    if (value <= t.warning) return { status: "healthy", label: "Healthy" };
    if (value <= t.critical) return { status: "warning", label: "Warning" };
    return { status: "critical", label: "Critical" };
  }
}

// getMetricWithTrend — compares current vs previous period
export function getMetricWithTrend(
  key: MetricKey,
  current: number,
  previous: number
): MetricWithTrend {
  const delta = round1(current - previous);
  const deltaPercent =
    previous === 0 ? 0 : round1(((current - previous) / previous) * 100);
  const t = THRESHOLDS[key];

  let trend: "up" | "down" | "flat" = "flat";
  if (Math.abs(delta) > 0.05) {
    trend = delta > 0 ? "up" : "down";
  }

  // for time/bug metrics: lower is better → going down is positive
  // for count metrics: higher is better → going up is positive
  const isPositive = t.higherIsBetter ? trend === "up" : trend === "down";

  return { current, previous, delta, deltaPercent, trend, isPositive };
}

// getAllMetricStatuses — convenience helper to get status for all 5 metrics
export function getAllMetricStatuses(
  metrics: DeveloperMetrics
): Record<MetricKey, MetricStatus> {
  return {
    leadTime: getMetricStatus("leadTime", metrics.leadTime),
    cycleTime: getMetricStatus("cycleTime", metrics.cycleTime),
    bugRate: getMetricStatus("bugRate", metrics.bugRate),
    deployFrequency: getMetricStatus("deployFrequency", metrics.deployFrequency),
    prThroughput: getMetricStatus("prThroughput", metrics.prThroughput),
  };
}

// getFlaggedMetrics — returns keys of metrics that are warning or critical
export function getFlaggedMetrics(metrics: DeveloperMetrics): MetricKey[] {
  const statuses = getAllMetricStatuses(metrics);
  return (Object.entries(statuses) as [MetricKey, MetricStatus][])
    .filter(([, s]) => s.status !== "healthy")
    .map(([key]) => key);
}

// getOverallStatus — roll up all metrics into one status
export function getOverallStatus(
  metrics: DeveloperMetrics
): "healthy" | "warning" | "critical" {
  const statuses = Object.values(getAllMetricStatuses(metrics)).map(
    (s) => s.status
  );
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  return "healthy";
}
