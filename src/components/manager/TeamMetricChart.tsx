"use client";

// src/components/manager/TeamMetricChart.tsx
// horizontal bar chart comparing one metric across all team members
// used in the manager view to spot outliers visually

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TeamMetricRow, MetricKey } from "@/types";

interface TeamMetricChartProps {
  data: TeamMetricRow[];
  metricKey: MetricKey;
  label: string;
  formatter: (v: number) => string;
}

// color based on status
function getBarColor(row: TeamMetricRow, key: MetricKey): string {
  const flag = row.flags.includes(key);
  if (row.overallStatus === "critical" && flag) return "#f43f5e"; // rose-500
  if (row.overallStatus === "warning" && flag) return "#f59e0b"; // amber-500
  return "#10b981"; // emerald-500
}

function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  formatter: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border px-3 py-2 text-xs font-mono shadow-sm">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground font-medium">{formatter(payload[0].value)}</p>
    </div>
  );
}

export function TeamMetricChart({
  data,
  metricKey,
  label,
  formatter,
}: TeamMetricChartProps) {
  const chartData = data.map((row) => ({
    name: row.developer.name.split(" ")[0], // first name only for space
    value: row.metrics[metricKey] as number,
    fullName: row.developer.name,
    status: row.overallStatus,
    flagged: row.flags.includes(metricKey),
    row,
  }));

  return (
    <div className="border border-border p-5 bg-card">
      <p className="text-xs font-label uppercase tracking-[0.16em] text-muted-foreground mb-4">
        {label}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fontFamily: "var(--font-data)", fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-data)", fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={32}
            tickFormatter={formatter}
          />
          <Tooltip
            content={<CustomTooltip formatter={formatter} />}
            cursor={{ fill: "color-mix(in srgb, var(--muted) 30%, transparent)" }}
          />
          <Bar dataKey="value" maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.row, metricKey)} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
