"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartCard } from "./chart-card";

interface TaskStatusPieProps {
  todo: number;
  inProgress: number;
  completed: number;
}

const COLORS: Record<string, string> = {
  TODO: "hsl(var(--muted-foreground))",
  IN_PROGRESS: "hsl(var(--primary))",
  DONE: "hsl(142, 76%, 36%)",
};

const LABELS: Record<string, string> = {
  TODO: "待办",
  IN_PROGRESS: "进行中",
  DONE: "已完成",
};

export function TaskStatusPie({ todo, inProgress, completed }: TaskStatusPieProps) {
  const data = [
    { name: LABELS.TODO, value: todo, key: "TODO" },
    { name: LABELS.IN_PROGRESS, value: inProgress, key: "IN_PROGRESS" },
    { name: LABELS.DONE, value: completed, key: "DONE" },
  ].filter((d) => d.value > 0);

  const total = todo + inProgress + completed;

  return (
    <ChartCard title="任务状态分布" empty={total === 0}>
      <ResponsiveContainer width="100%" height={240}>
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
    </ChartCard>
  );
}
