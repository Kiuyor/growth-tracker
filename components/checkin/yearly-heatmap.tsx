"use client";

import { useMemo } from "react";
import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { HeatmapData } from "@/types";

interface YearlyHeatmapProps {
  data: HeatmapData;
}

export function YearlyHeatmap({ data }: YearlyHeatmapProps) {
  const days = useMemo(() => {
    const yearStart = startOfYear(new Date(data.year, 0, 1));
    const yearEnd = endOfYear(new Date(data.year, 0, 1));
    return eachDayOfInterval({ start: yearStart, end: yearEnd });
  }, [data.year]);

  const valueMap = useMemo(() => {
    const map = new Map<string, { value: number; streak: number }>();
    data.data.forEach((d) => map.set(d.date, { value: d.value, streak: d.streak }));
    return map;
  }, [data.data]);

  const firstDayOffset = useMemo(() => {
    const firstDay = getDay(startOfYear(new Date(data.year, 0, 1)));
    return firstDay === 0 ? 6 : firstDay - 1;
  }, [data.year]);

  const getColor = (value: number, streak: number) => {
    if (value === 0) return "bg-muted";
    if (streak >= 30) return "bg-green-600";
    if (streak >= 14) return "bg-green-500";
    if (streak >= 7) return "bg-green-400";
    return "bg-green-300";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{data.year} 年打卡热力图</h3>
      </div>

      <div className="overflow-x-auto">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(53, minmax(10px, 1fr))`,
            minWidth: "max-content",
          }}
        >
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`offset-${i}`} />
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const record = valueMap.get(key);
            const value = record?.value || 0;
            const streak = record?.streak || 0;

            return (
              <div
                key={key}
                title={
                  value
                    ? `${key} 已打卡 · 连续 ${streak} 天`
                    : key
                }
                className={cn(
                  "aspect-square rounded-sm transition-colors hover:opacity-80",
                  getColor(value, streak)
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>少</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-green-300" />
          <div className="h-3 w-3 rounded-sm bg-green-400" />
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <div className="h-3 w-3 rounded-sm bg-green-600" />
        </div>
        <span>多</span>
      </div>
    </div>
  );
}
