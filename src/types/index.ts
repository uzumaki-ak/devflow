// src/types/index.ts
// all shared types live here — import from @/types everywhere

// ─── Source Data Models ─────────────────────────────────────────────────────

export interface Developer {
  id: string;
  name: string;
  email: string;
  team: string;
  role: "junior" | "mid" | "senior" | "lead";
  avatar?: string;
}

export interface Issue {
  id: string;
  developer_id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  started_at: string | null; // ISO datetime — when moved to in_progress
  completed_at: string | null; // ISO datetime — when moved to done
  month: string; // YYYY-MM for easier filtering
}

export interface PullRequest {
  id: string;
  developer_id: string;
  title: string;
  opened_at: string; // ISO datetime
  merged_at: string | null; // null if not yet merged
  month: string; // YYYY-MM
}

export interface Deployment {
  id: string;
  pr_id: string;
  developer_id: string;
  deployed_at: string; // ISO datetime
  success: boolean;
  month: string; // YYYY-MM
}

export interface Bug {
  id: string;
  issue_id: string | null;
  developer_id: string; // developer who shipped the work
  reported_at: string; // ISO datetime
  month: string; // YYYY-MM — month when the bug was found
}

// ─── Calculated Metrics ──────────────────────────────────────────────────────

export interface DeveloperMetrics {
  developer: Developer;
  period: string; // YYYY-MM
  leadTime: number; // avg days from PR open → successful deploy
  cycleTime: number; // avg days from issue in_progress → done
  bugRate: number; // percentage: (bugs / issues_completed) * 100
  deployFrequency: number; // count of successful deploys this month
  prThroughput: number; // count of merged PRs this month
}

export interface MetricStatus {
  status: "healthy" | "warning" | "critical";
  label: string;
}

export interface MetricWithTrend {
  current: number;
  previous: number;
  delta: number; // positive = increased, negative = decreased
  deltaPercent: number;
  trend: "up" | "down" | "flat";
  // for time metrics: down is good. for counts: up is good.
  isPositive: boolean; // whether this trend is good for the user
}

// ─── Interpretation Types ────────────────────────────────────────────────────

export interface Interpretation {
  summary: string; // one paragraph, the story behind the metrics
  highlight: string; // the single most important thing to note
  nextSteps: ActionStep[];
}

export interface ActionStep {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  metric: MetricKey; // which metric this step addresses
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export type MetricKey =
  | "leadTime"
  | "cycleTime"
  | "bugRate"
  | "deployFrequency"
  | "prThroughput";

export interface TeamMetricRow {
  developer: Developer;
  metrics: DeveloperMetrics;
  flags: MetricKey[]; // metrics that are warning or critical
  overallStatus: "healthy" | "warning" | "critical";
}

export interface ApiError {
  error: string;
  status: number;
}
