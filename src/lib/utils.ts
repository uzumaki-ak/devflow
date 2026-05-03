// src/lib/utils.ts
// small helpers used everywhere — nothing fancy here

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn — merge tailwind classes without conflicts
// using this instead of writing out the twMerge + clsx combo every time
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// daysBetween — returns floating-point days between two ISO date strings
// used for lead time and cycle time calculations
export function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

// round to 1 decimal — keeps metric display clean
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

// formatPeriod — "2026-05" → "May 2026"
export function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// prevPeriod — "2026-05" → "2026-04"
export function prevPeriod(period: string): string {
  const [year, month] = period.split("-").map(Number);
  const date = new Date(year, month - 2, 1); // month-2 because months are 0-indexed
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// formatDays — 2.5 → "2.5d", 0 → "—"
export function formatDays(days: number): string {
  if (days === 0) return "—";
  return `${round1(days)}d`;
}

// formatPercent — 12.5 → "12.5%"
export function formatPercent(value: number): string {
  return `${round1(value)}%`;
}

// deltaSign — positive number gets "+" prefix for display
export function deltaSign(value: number): string {
  return value > 0 ? `+${round1(value)}` : `${round1(value)}`;
}

// available periods for the period selector
export const AVAILABLE_PERIODS = ["2026-05", "2026-04"] as const;
export type Period = (typeof AVAILABLE_PERIODS)[number];
