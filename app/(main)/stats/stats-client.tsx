"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeeklyTrendChart } from "@/components/charts/weekly-trend-chart";
import { TaskStatusPie } from "@/components/charts/task-status-pie";
import { TaskCategoryBar } from "@/components/charts/task-category-bar";
import { PointsSourcePie } from "@/components/charts/points-source-pie";
import { PomodoroHourBar } from "@/components/charts/pomodoro-hour-bar";
import { MoodLineChart } from "@/components/charts/mood-line-chart";
import { YearlyHeatmap } from "@/components/checkin/yearly-heatmap";
import type { OverviewStats, HeatmapData, TimeRange } from "@/types";

interface StatsClientProps {
  initialOverview: OverviewStats;
  initialHeatmap: HeatmapData;
}

export function StatsClient({ initialOverview, initialHeatmap }: StatsClientProps) {
  const [range, setRange] = useState<TimeRange>("7");
  const [overview, setOverview] = useState(initialOverview);

  const handleRangeChange = async (newRange: TimeRange) => {
    setRange(newRange);
    const res = await fetch(`/api/stats/overview?days=${newRange}`);
    if (res.ok) {
      const data = (await res.json()) as OverviewStats;
      setOverview(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">数据统计</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={range === "7" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRangeChange("7")}
          >
            近 7 天
          </Button>
          <Button
            variant={range === "30" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRangeChange("30")}
          >
            近 30 天
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyTrendChart data={overview.daily} />
        <MoodLineChart data={overview.daily} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TaskStatusPie
          todo={overview.tasks.todo}
          inProgress={overview.tasks.inProgress}
          completed={overview.tasks.completed}
        />
        <TaskCategoryBar data={overview.tasks.byCategory} />
        <PointsSourcePie data={overview.pointsBySource} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PomodoroHourBar data={overview.pomodoroByHour} />
        <div className="rounded-xl border bg-card p-6 shadow">
          <YearlyHeatmap data={initialHeatmap} />
        </div>
      </div>
    </div>
  );
}
