"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChartCard } from "./chart-card";

interface StreakChartProps {
  data: { date: string; streak: number }[];
}

export function StreakChart({ data }: StreakChartProps) {
  const hasData = data.some((d) => d.streak > 0);

  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "M/d", { locale: zhCN }),
  }));

  return (
    <ChartCard title="连续打卡天数变化" empty={!hasData}>
      <div className="h-full min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis tick={{ fontSize: 12 }} domain={[0, "dataMax + 5"]} />
            <Tooltip
              formatter={(value) => [`${value} 天`, "连续打卡"]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="streak"
              name="连续打卡天数"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary) / 0.2)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
