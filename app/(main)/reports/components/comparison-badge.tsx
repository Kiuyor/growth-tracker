"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonBadgeProps {
  value: number | null;
  suffix?: string;
}

export function ComparisonBadge({ value, suffix = "%" }: ComparisonBadgeProps) {
  if (value === null || value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        持平
      </span>
    );
  }

  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", colorClass)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}
