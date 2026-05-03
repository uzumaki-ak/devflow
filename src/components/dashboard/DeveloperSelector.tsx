"use client";

// src/components/dashboard/DeveloperSelector.tsx
// dropdown to switch between developers — small but important UX piece
// using a native <select> styled manually to avoid Radix UI complexity

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Developer } from "@/types";

interface DeveloperSelectorProps {
  developers: Developer[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function DeveloperSelector({
  developers,
  selectedId,
  onChange,
}: DeveloperSelectorProps) {
  const selected = developers.find((d) => d.id === selectedId);

  return (
    <div className="relative inline-flex items-center">
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none cursor-pointer",
          "border border-border bg-background text-foreground",
          "pl-3 pr-8 py-2 text-sm font-ui",
          "focus:outline-none focus:border-foreground",
          "hover:border-foreground/50 transition-colors"
        )}
        aria-label="Select developer"
      >
        {developers.map((dev) => (
          <option key={dev.id} value={dev.id}>
            {dev.name} — {dev.team}
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
