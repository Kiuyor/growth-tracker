"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChartCard } from "./chart-card";
import type { DailyStat } from "@/types";

interface MoodLineChartProps {
  data: DailyStat[];
}

export function MoodLineChart({ data }: MoodLineChartProps) {
  const hasData = data.some((d) => d.moodScore !== null);

  const formatted = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "M/d", { locale: zhCN }),
  }));

  return (
    <ChartCard title="心情变化趋势" empty={!hasData}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formatted} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="moodScore"
            name="心情评分"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
