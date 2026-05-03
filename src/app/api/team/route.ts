// src/app/api/team/route.ts
// returns metrics for the entire team — used on the manager summary page
// query param: ?period=2026-05

import { NextRequest, NextResponse } from "next/server";
import developers from "@/data/developers.json";
import issues from "@/data/issues.json";
import pullRequests from "@/data/pull-requests.json";
import deployments from "@/data/deployments.json";
import bugs from "@/data/bugs.json";
import {
  calcDeveloperMetrics,
  getFlaggedMetrics,
  getOverallStatus,
} from "@/lib/metrics";
import type {
  Developer,
  Issue,
  PullRequest,
  Deployment,
  Bug,
  TeamMetricRow,
} from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "2026-05";

  // calculate metrics for every developer
  const teamRows: TeamMetricRow[] = (developers as Developer[]).map((dev) => {
    const metrics = calcDeveloperMetrics(
      dev,
      period,
      issues as Issue[],
      pullRequests as PullRequest[],
      deployments as Deployment[],
      bugs as Bug[]
    );

    return {
      developer: dev,
      metrics,
      flags: getFlaggedMetrics(metrics),
      overallStatus: getOverallStatus(metrics),
    };
  });

  // sort: critical first, then warning, then healthy
  const statusOrder = { critical: 0, warning: 1, healthy: 2 };
  teamRows.sort(
    (a, b) => statusOrder[a.overallStatus] - statusOrder[b.overallStatus]
  );

  return NextResponse.json({ period, team: teamRows });
}
