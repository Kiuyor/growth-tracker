"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { POINT_SOURCE_LABEL } from "@/lib/labels";
import type { PointSource } from "@/types";
import { ChartCard } from "./chart-card";

interface PointsSourcePieProps {
  data: { source: string; amount: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

export function PointsSourcePie({ data }: PointsSourcePieProps) {
  const validData = data
    .filter((d) => d.amount > 0)
    .map((d) => ({
      name: POINT_SOURCE_LABEL[d.source as PointSource] || d.source,
      value: d.amount,
    }));

  return (
    <ChartCard title="积分来源占比" empty={validData.length === 0}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {validData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} 分`, "积分"]}
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
