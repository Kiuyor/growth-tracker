"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChartCard } from "./chart-card";
import type { DailyStat } from "@/types";

interface WeeklyTrendChartProps {
  data: DailyStat[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const hasData = data.some(
    (d) => d.pomodoroMinutes > 0 || d.moodScore !== null || d.tasksCompleted > 0
  );

  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "M/d", { locale: zhCN }),
  }));

  return (
    <ChartCard title="学习心情趋势" empty={!hasData} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={formatted} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            domain={[0, "dataMax + 30"]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            domain={[0, 5]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            yAxisId="left"
            dataKey="pomodoroMinutes"
            name="专注分钟"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="moodScore"
            name="心情评分"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
