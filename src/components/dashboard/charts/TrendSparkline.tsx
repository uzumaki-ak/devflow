"use client";

// src/components/dashboard/charts/TrendSparkline.tsx
// tiny sparkline showing metric values across current + previous period
// keeping it minimal — the point is trend direction, not data density

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import type { MetricWithTrend } from "@/types";

interface TrendSparklineProps {
  trend: MetricWithTrend;
  label: string;
  color: string;
}

// custom tooltip keeps it clean
function SparkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border px-2 py-1 text-[11px] font-mono">
      {payload[0].value}
    </div>
  );
}

export function TrendSparkline({ trend, label, color }: TrendSparklineProps) {
  // just two data points: prev → current
  const data = [
    { period: "Prev", value: trend.previous },
    { period: "Now", value: trend.current },
  ];

  return (
    <div className="h-10 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip content={<SparkTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={{ r: 2, fill: color }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
