"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartCard } from "./chart-card";

interface TaskCategoryBarProps {
  data: { category: string; count: number }[];
}

export function TaskCategoryBar({ data }: TaskCategoryBarProps) {
  const validData = data.filter((d) => d.category).slice(0, 8);

  return (
    <ChartCard title="任务分类" empty={validData.length === 0}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={validData}
          layout="vertical"
          margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Bar
            dataKey="count"
            name="任务数"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
