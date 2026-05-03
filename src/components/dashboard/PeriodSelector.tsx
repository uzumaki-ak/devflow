"use client";

// src/components/dashboard/PeriodSelector.tsx
// lets the user switch between available data periods (months)

import { ChevronDown } from "lucide-react";
import { cn, formatPeriod, AVAILABLE_PERIODS } from "@/lib/utils";

interface PeriodSelectorProps {
  selected: string;
  onChange: (period: string) => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none cursor-pointer",
          "border border-border bg-background text-foreground",
          "pl-3 pr-8 py-2 text-sm",
          "focus:outline-none focus:border-foreground",
          "hover:border-foreground/50 transition-colors",
          "font-label text-xs tracking-[0.12em]"
        )}
        aria-label="Select time period"
      >
        {AVAILABLE_PERIODS.map((period) => (
          <option key={period} value={period}>
            {formatPeriod(period)}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  );
}
