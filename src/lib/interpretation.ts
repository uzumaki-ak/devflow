// src/lib/interpretation.ts
// rule-based interpretation engine — looks at all 5 metrics together and
// generates a human-readable story + actionable next steps
// keeping this deterministic and fast (no LLM call needed for MVP)

import type {
  DeveloperMetrics,
  Interpretation,
  ActionStep,
  MetricKey,
} from "@/types";
import {
  getMetricStatus,
  getMetricWithTrend,
  getAllMetricStatuses,
} from "@/lib/metrics";

// ─── Story Templates ──────────────────────────────────────────────────────────
// a few paragraph templates based on the most dominant problem pattern

function buildSummary(metrics: DeveloperMetrics, prevMetrics?: DeveloperMetrics): string {
  const { leadTime, cycleTime, bugRate, deployFrequency, prThroughput } = metrics;
  const statuses = getAllMetricStatuses(metrics);

  // figure out the dominant problem to lead with
  const criticals = Object.entries(statuses)
    .filter(([, s]) => s.status === "critical")
    .map(([k]) => k as MetricKey);
  const warnings = Object.entries(statuses)
    .filter(([, s]) => s.status === "warning")
    .map(([k]) => k as MetricKey);

  const issues = [...criticals, ...warnings];

  // all good — celebrate
  if (issues.length === 0) {
    return `Everything looks solid this month. Lead time is at ${leadTime}d, cycle time at ${cycleTime}d, and the bug rate of ${bugRate}% is well within healthy range. You shipped ${deployFrequency} successful deploys and merged ${prThroughput} PRs. Keep the rhythm going — this kind of consistent delivery compounds over time.`;
  }

  // high lead time + low deploys → review/CI bottleneck story
  if (
    (statuses.leadTime.status !== "healthy" || statuses.deployFrequency.status !== "healthy") &&
    leadTime > 5
  ) {
    return `Lead time is sitting at ${leadTime}d, which is above healthy range. Combined with ${deployFrequency} deploys this month, the pattern suggests work is getting stuck somewhere between merge and production — usually in CI pipelines, manual gates, or queued deployments. ${prThroughput} PRs got merged, so the writing pace is fine. The bottleneck is likely post-merge. Worth checking if there are any flaky tests, slow build steps, or approvals holding things up.`;
  }

  // high bug rate → quality story
  if (statuses.bugRate.status !== "healthy") {
    return `Bug rate this month is ${bugRate}%, which is higher than ideal. With ${prThroughput} PRs merged and ${deployFrequency} deploys, the velocity looks good on the surface — but escaped bugs suggest something in the review or testing process is letting issues through. High PR throughput with high bug rate is often a sign of PRs being merged without enough coverage or review depth. Slowing down slightly to review more carefully usually pays off.`;
  }

  // high cycle time → planning/blocked work story
  if (statuses.cycleTime.status !== "healthy") {
    return `Cycle time is at ${cycleTime}d on average, which is on the higher side. Issues are taking longer to move from In Progress to Done — this can happen due to blocked work, unclear requirements, or tasks that are scoped too large. The ${prThroughput} PRs merged suggests you're working, but the issue completion lag hints at WIP piling up. Breaking work into smaller chunks usually helps here.`;
  }

  // low throughput → capacity/focus story
  if (statuses.prThroughput.status !== "healthy" || statuses.deployFrequency.status !== "healthy") {
    return `Output this month was lower than expected — ${prThroughput} PRs merged and ${deployFrequency} deploys. This can happen for legitimate reasons (big refactors, hard problems, unplanned incidents), but if this pattern continues it's worth checking if there's too much context-switching, too many meeting interruptions, or tasks that are blocked waiting on others. Cycle time of ${cycleTime}d and lead time of ${leadTime}d are worth watching too.`;
  }

  // fallback — mixed issues
  return `This month had a mix of signals. ${prThroughput} PRs merged with a ${bugRate}% bug rate and ${leadTime}d average lead time. There are a couple of metrics outside the healthy range — see the flags below for specifics. No single story explains everything here, so worth doing a quick retro to understand what's driving each.`;
}

// ─── Action Step Templates ───────────────────────────────────────────────────

function buildActionSteps(metrics: DeveloperMetrics): ActionStep[] {
  const statuses = getAllMetricStatuses(metrics);
  const steps: ActionStep[] = [];

  // lead time actions
  if (statuses.leadTime.status !== "healthy") {
    if (metrics.leadTime > 7) {
      steps.push({
        id: "lt_1",
        priority: "high",
        title: "Audit your deployment pipeline",
        description:
          "Lead time over 7 days almost always points to a slow or blocked pipeline. Look at the longest steps in your CI/CD process — flaky tests and manual approval gates are the usual culprits.",
        metric: "leadTime",
      });
    } else {
      steps.push({
        id: "lt_2",
        priority: "medium",
        title: "Request faster reviews on your PRs",
        description:
          "Lead time in the 4-7 day range often means PRs are sitting waiting for review. Try tagging reviewers directly or batching review requests at predictable times.",
        metric: "leadTime",
      });
    }
  }

  // cycle time actions
  if (statuses.cycleTime.status !== "healthy") {
    steps.push({
      id: "ct_1",
      priority: statuses.cycleTime.status === "critical" ? "high" : "medium",
      title: "Break issues into smaller tasks",
      description:
        "High cycle time usually means tasks are too large or blocked on external dependencies. Try splitting epics into 1-2 day sub-tasks to keep things flowing.",
      metric: "cycleTime",
    });
  }

  // bug rate actions
  if (statuses.bugRate.status !== "healthy") {
    steps.push({
      id: "br_1",
      priority: statuses.bugRate.status === "critical" ? "high" : "medium",
      title: "Add a pre-merge testing checklist",
      description:
        "Before marking a PR ready for review, run through: unit tests pass, edge cases covered, tested locally in a staging environment. A quick checklist cuts bug rate fast.",
      metric: "bugRate",
    });
    if (metrics.bugRate > 20) {
      steps.push({
        id: "br_2",
        priority: "high",
        title: "Require 2 reviewers on your next 5 PRs",
        description:
          "A second set of eyes catches the things you're too close to see. For a sprint, require 2 approvals and track if bug rate improves the following month.",
        metric: "bugRate",
      });
    }
  }

  // deploy frequency actions
  if (statuses.deployFrequency.status !== "healthy") {
    steps.push({
      id: "df_1",
      priority: "medium",
      title: "Ship smaller, more frequently",
      description:
        "Low deploy frequency often comes from batching too much into one release. Aim for at least 1 deploy per week by shipping smaller PRs that are self-contained.",
      metric: "deployFrequency",
    });
  }

  // pr throughput actions
  if (statuses.prThroughput.status !== "healthy") {
    steps.push({
      id: "pt_1",
      priority: "medium",
      title: "Identify your biggest time blockers",
      description:
        "Low PR throughput can mean too much context switching, blocked work, or PRs stuck in review. Keep a quick log for one week of where time actually goes — the answer is usually surprising.",
      metric: "prThroughput",
    });
  }

  // if nothing is broken, still give a forward-looking step
  if (steps.length === 0) {
    steps.push({
      id: "all_good_1",
      priority: "low",
      title: "Document what's working",
      description:
        "Your metrics are healthy this month. Take 30 minutes to write down the habits or workflows that got you here — it's easy to forget during a rough month.",
      metric: "prThroughput",
    });
  }

  // return max 3 steps, highest priority first
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return steps
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 3);
}

// ─── Main Interpreter ────────────────────────────────────────────────────────

// interpret — entry point, call this with current + optional previous metrics
export function interpret(
  metrics: DeveloperMetrics,
  prevMetrics?: DeveloperMetrics
): Interpretation {
  const summary = buildSummary(metrics, prevMetrics);
  const nextSteps = buildActionSteps(metrics);

  // highlight — the single most important thing right now
  const statuses = getAllMetricStatuses(metrics);
  const criticalKeys = Object.entries(statuses)
    .filter(([, s]) => s.status === "critical")
    .map(([k]) => k as MetricKey);
  const warningKeys = Object.entries(statuses)
    .filter(([, s]) => s.status === "warning")
    .map(([k]) => k as MetricKey);

  let highlight: string;

  if (criticalKeys.length > 0) {
    const key = criticalKeys[0];
    const labels: Record<MetricKey, string> = {
      leadTime: `Lead time is critical at ${metrics.leadTime}d — this is the most important thing to fix right now.`,
      cycleTime: `Cycle time is critical at ${metrics.cycleTime}d — tasks are taking too long to complete.`,
      bugRate: `Bug rate is at ${metrics.bugRate}% — quality issues are escaping to production.`,
      deployFrequency: `Only ${metrics.deployFrequency} successful deploys this month — deployment cadence needs attention.`,
      prThroughput: `Only ${metrics.prThroughput} PRs merged — throughput is significantly below healthy levels.`,
    };
    highlight = labels[key];
  } else if (warningKeys.length > 0) {
    highlight = `${warningKeys.length} metric${warningKeys.length > 1 ? "s are" : " is"} in warning range — not urgent, but worth watching.`;
  } else {
    highlight = "All metrics are in healthy range. Nothing urgent this month.";
  }

  return { summary, highlight, nextSteps };
}
