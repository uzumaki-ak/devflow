// src/components/layout/Skeleton.tsx
// generic skeleton shimmer — used while data is loading
// keeping it dead simple, just a div with animate-pulse

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/40",
        className
      )}
    />
  );
}

// MetricCardSkeleton — placeholder for the metric cards grid
export function MetricCardSkeleton() {
  return (
    <div className="min-h-[230px] p-5 sm:p-6 grid grid-rows-[auto_auto_1fr_auto] gap-4 border border-border bg-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-10 w-28" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

// InterpretationSkeleton — placeholder for the interpretation section
export function InterpretationSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-3 w-28" />
      <div className="border border-border p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
