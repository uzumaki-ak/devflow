"use client";

// src/components/dashboard/NextStepsPanel.tsx
// shows 1-3 prioritized action steps the developer should take
// priority badges + metric tags so context is clear at a glance

import { ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionStep, MetricKey } from "@/types";

interface NextStepsPanelProps {
  steps: ActionStep[];
}

const priorityStyles = {
  high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

// friendly display names for each metric
const metricLabels: Record<MetricKey, string> = {
  leadTime: "Lead Time",
  cycleTime: "Cycle Time",
  bugRate: "Bug Rate",
  deployFrequency: "Deploy Freq",
  prThroughput: "PR Throughput",
};

export function NextStepsPanel({ steps }: NextStepsPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* section header */}
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-accent" strokeWidth={1.5} />
        <h2 className="text-xs font-label uppercase tracking-[0.16em] text-muted-foreground">
          What To Do Next
        </h2>
      </div>

      {/* steps list */}
      <div className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="border border-border p-4 flex flex-col gap-2 hover:border-border/80 transition-colors bg-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* step number */}
                <span className="text-xs font-data text-muted-foreground w-4">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[1.05rem] font-ui font-semibold tracking-[-0.01em] text-foreground">
                  {step.title}
                </h3>
              </div>
              {/* priority + metric badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-label uppercase tracking-[0.14em] px-1.5 py-0.5 border",
                    priorityStyles[step.priority]
                  )}
                >
                  {step.priority}
                </span>
              </div>
            </div>

            <p className="text-sm font-body text-muted-foreground leading-relaxed ml-6">
              {step.description}
            </p>

            {/* metric tag */}
            <div className="ml-6 flex items-center gap-1 text-[10px] font-label text-muted-foreground/60 uppercase tracking-[0.14em]">
              <ArrowRight size={10} />
              <span>Affects {metricLabels[step.metric]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
