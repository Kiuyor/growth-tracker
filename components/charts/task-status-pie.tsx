"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { STATUS_LABEL } from "@/lib/labels";
import type { TaskStatus } from "@/types";
import { ChartCard } from "./chart-card";

interface TaskStatusPieProps {
  todo: number;
  inProgress: number;
  completed: number;
}

const COLORS: Record<TaskStatus, string> = {
  TODO: "hsl(var(--muted-foreground))",
  IN_PROGRESS: "hsl(var(--primary))",
  DONE: "hsl(var(--chart-2))",
  ARCHIVED: "hsl(var(--muted))",
};

export function TaskStatusPie({ todo, inProgress, completed }: TaskStatusPieProps) {
  const data = [
    { name: STATUS_LABEL.TODO, value: todo, key: "TODO" as TaskStatus },
    { name: STATUS_LABEL.IN_PROGRESS, value: inProgress, key: "IN_PROGRESS" as TaskStatus },
    { name: STATUS_LABEL.DONE, value: completed, key: "DONE" as TaskStatus },
  ].filter((d) => d.value > 0);

  const total = todo + inProgress + completed;

  return (
    <ChartCard title="任务状态分布" empty={total === 0} className="h-full w-full">
      <div className="h-full min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} 个`, "数量"]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
