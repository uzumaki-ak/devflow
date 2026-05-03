"use client";

// src/hooks/useTeamMetrics.ts
// fetches team-wide metrics for the manager view

import { useState, useEffect, useCallback } from "react";
import type { TeamMetricRow } from "@/types";

interface TeamResponse {
  period: string;
  team: TeamMetricRow[];
}

interface UseTeamMetricsReturn {
  data: TeamResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTeamMetrics(period: string): UseTeamMetricsReturn {
  const [data, setData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/team?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch team metrics");
      const json: TeamResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}
