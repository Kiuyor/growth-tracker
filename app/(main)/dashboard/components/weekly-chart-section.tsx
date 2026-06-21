import { WeeklyTrendChart } from "@/components/charts/weekly-trend-chart";
import { TaskStatusPie } from "@/components/charts/task-status-pie";
import type { DailyStat } from "@/types";

interface WeeklyChartSectionProps {
  weeklyDaily: DailyStat[];
  taskStatusCounts: { TODO: number; IN_PROGRESS: number; DONE: number };
}

export function WeeklyChartSection({
  weeklyDaily,
  taskStatusCounts,
}: WeeklyChartSectionProps) {
  return (
    <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
      <div className="h-full min-h-0 lg:col-span-2">
        <WeeklyTrendChart data={weeklyDaily} />
      </div>
      <div className="h-full min-h-0">
        <TaskStatusPie
          todo={taskStatusCounts.TODO}
          inProgress={taskStatusCounts.IN_PROGRESS}
          completed={taskStatusCounts.DONE}
        />
      </div>
    </div>
  );
}
