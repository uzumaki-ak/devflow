import type { MetricKey } from "@/types";

export interface MetricRuleInfo {
  label: string;
  formula: string;
  thresholds: string;
}

export const METRIC_RULES: Record<MetricKey, MetricRuleInfo> = {
  leadTime: {
    label: "Lead Time",
    formula: "Avg days from PR opened to first successful production deploy",
    thresholds: "Healthy <= 4d | Warning > 4d and <= 7d | Critical > 7d",
  },
  cycleTime: {
    label: "Cycle Time",
    formula: "Avg days from issue In Progress to Done",
    thresholds: "Healthy <= 3d | Warning > 3d and <= 6d | Critical > 6d",
  },
  bugRate: {
    label: "Bug Rate",
    formula: "Escaped production bugs / issues completed * 100",
    thresholds: "Healthy <= 10% | Warning > 10% and <= 20% | Critical > 20%",
  },
  deployFrequency: {
    label: "Deploy Frequency",
    formula: "Successful production deployments in the selected month",
    thresholds: "Healthy >= 4 | Warning >= 2 and < 4 | Critical < 2",
  },
  prThroughput: {
    label: "PR Throughput",
    formula: "Merged pull requests in the selected month",
    thresholds: "Healthy >= 5 | Warning >= 3 and < 5 | Critical < 3",
  },
};
