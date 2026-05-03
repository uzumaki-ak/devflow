// src/app/api/metrics/[devId]/route.ts
// calculates and returns metrics for a single developer for a given period
// query params: ?period=2026-05 (defaults to current month)

import { NextRequest, NextResponse } from "next/server";
import developers from "@/data/developers.json";
import issues from "@/data/issues.json";
import pullRequests from "@/data/pull-requests.json";
import deployments from "@/data/deployments.json";
import bugs from "@/data/bugs.json";
import {
  calcDeveloperMetrics,
  getAllMetricStatuses,
  getFlaggedMetrics,
  getOverallStatus,
  getMetricWithTrend,
} from "@/lib/metrics";
import { interpret } from "@/lib/interpretation";
import { prevPeriod } from "@/lib/utils";
import type { Developer, Issue, PullRequest, Deployment, Bug } from "@/types";

// no caching here — metrics are per-request with user-selected period
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ devId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { devId } = await params;
  const { searchParams } = new URL(request.url);

  // default to May 2026 — most recent month we have data for
  const period = searchParams.get("period") ?? "2026-05";

  // find the developer
  const developer = (developers as Developer[]).find((d) => d.id === devId);
  if (!developer) {
    return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  }

  // calculate current and previous period metrics
  const current = calcDeveloperMetrics(
    developer,
    period,
    issues as Issue[],
    pullRequests as PullRequest[],
    deployments as Deployment[],
    bugs as Bug[]
  );

  const prev = calcDeveloperMetrics(
    developer,
    prevPeriod(period),
    issues as Issue[],
    pullRequests as PullRequest[],
    deployments as Deployment[],
    bugs as Bug[]
  );

  // get interpretation for the current period
  const interpretation = interpret(current, prev);

  // build trend comparisons for each metric
  const trends = {
    leadTime: getMetricWithTrend("leadTime", current.leadTime, prev.leadTime),
    cycleTime: getMetricWithTrend("cycleTime", current.cycleTime, prev.cycleTime),
    bugRate: getMetricWithTrend("bugRate", current.bugRate, prev.bugRate),
    deployFrequency: getMetricWithTrend(
      "deployFrequency",
      current.deployFrequency,
      prev.deployFrequency
    ),
    prThroughput: getMetricWithTrend(
      "prThroughput",
      current.prThroughput,
      prev.prThroughput
    ),
  };

  return NextResponse.json({
    developer,
    period,
    metrics: current,
    previousMetrics: prev,
    trends,
    statuses: getAllMetricStatuses(current),
    flaggedMetrics: getFlaggedMetrics(current),
    overallStatus: getOverallStatus(current),
    interpretation,
  });
}
