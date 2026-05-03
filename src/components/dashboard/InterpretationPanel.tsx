"use client";

// src/components/dashboard/InterpretationPanel.tsx
// shows the rule-based AI interpretation of the current metric snapshot
// the highlight box is the most important thing — keep it visually distinct

import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Interpretation } from "@/types";

interface InterpretationPanelProps {
  interpretation: Interpretation;
  overallStatus: "healthy" | "warning" | "critical";
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/5 border-emerald-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/5 border-amber-500/20",
  },
  critical: {
    icon: AlertTriangle,
    color: "text-rose-500",
    bg: "bg-rose-500/5 border-rose-500/20",
  },
};

export function InterpretationPanel({
  interpretation,
  overallStatus,
}: InterpretationPanelProps) {
  const config = statusConfig[overallStatus];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-5">
      {/* section header */}
      <div className="flex items-center gap-2">
        <Lightbulb size={14} className="text-accent" strokeWidth={1.5} />
        <h2 className="text-xs font-label uppercase tracking-[0.16em] text-muted-foreground">
          What This Means
        </h2>
      </div>

      {/* highlight — the single most important callout */}
      <div className={cn("border p-4 flex items-start gap-3", config.bg)}>
        <Icon size={16} className={cn("mt-0.5 shrink-0", config.color)} strokeWidth={1.5} />
        <p className={cn("text-lg font-accent italic leading-relaxed", config.color)}>
          {interpretation.highlight}
        </p>
      </div>

      {/* full summary paragraph */}
      <p className="text-sm font-body text-muted-foreground leading-7">
        {interpretation.summary}
      </p>
    </div>
  );
}
