"use client";

// src/hooks/useMetrics.ts
// data fetching hook for developer metrics — handles loading, error, refetch
// using plain fetch + useEffect to keep deps minimal (no SWR or TanStack needed for this scope)

import { useState, useEffect, useCallback } from "react";
import type {
  DeveloperMetrics,
  MetricKey,
  MetricStatus,
  MetricWithTrend,
  Interpretation,
  Developer,
} from "@/types";

interface MetricsResponse {
  developer: Developer;
  period: string;
  metrics: DeveloperMetrics;
  previousMetrics: DeveloperMetrics;
  trends: Record<MetricKey, MetricWithTrend>;
  statuses: Record<MetricKey, MetricStatus>;
  flaggedMetrics: MetricKey[];
  overallStatus: "healthy" | "warning" | "critical";
  interpretation: Interpretation;
}

interface UseMetricsReturn {
  data: MetricsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMetrics(devId: string, period: string): UseMetricsReturn {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!devId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/metrics/${devId}?period=${period}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch metrics");
      }
      const json: MetricsResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [devId, period]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}
