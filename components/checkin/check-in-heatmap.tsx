"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DailyCheckRecord {
  date: Date | string;
  streak: number;
}

interface CheckInHeatmapProps {
  history: DailyCheckRecord[];
  year?: number;
  month?: number;
}

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

export function CheckInHeatmap({
  history,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
}: CheckInHeatmapProps) {
  const today = new Date();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const checkedMap = useMemo(() => {
    const map = new Map<string, number>();
    history.forEach((record) => {
      const d = typeof record.date === "string" ? new Date(record.date) : record.date;
      const key = format(d, "yyyy-MM-dd");
      map.set(key, record.streak);
    });
    return map;
  }, [history]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">月度打卡热力图</h3>
        <span className="text-sm text-muted-foreground">
          {format(monthStart, "yyyy年M月", { locale: zhCN })}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const streak = checkedMap.get(key);
          const checked = streak !== undefined;
          const inMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={key}
              title={
                checked
                  ? `${format(day, "yyyy-MM-dd")} 已打卡 · 连续 ${streak} 天`
                  : format(day, "yyyy-MM-dd")
              }
              className={cn(
                "aspect-square rounded-md text-xs flex items-center justify-center transition-colors",
                checked
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-muted hover:bg-muted/80",
                !inMonth && "opacity-30",
                isToday && "ring-2 ring-primary ring-offset-1"
              )}
            >
              {checked && streak >= 7 ? "🔥" : format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
