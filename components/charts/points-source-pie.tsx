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

interface PointsSourcePieProps {
  data: { source: string; amount: number }[];
}

const SOURCE_LABELS: Record<string, string> = {
  TASK_COMPLETE: "完成任务",
  DAILY_CHECK: "每日打卡",
  POMODORO: "番茄钟",
  ACHIEVEMENT: "成就达成",
  STREAK_BONUS: "连续打卡奖励",
  SHOP_SPEND: "商店消费",
  MANUAL_ADJUST: "手动调整",
  MOOD_ENTRY: "心情随记",
  MOOD_STREAK: "心情连续记录",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(270, 70%, 60%)",
  "hsl(190, 80%, 45%)",
  "hsl(320, 80%, 60%)",
  "hsl(160, 80%, 40%)",
];

export function PointsSourcePie({ data }: PointsSourcePieProps) {
  const validData = data
    .filter((d) => d.amount > 0)
    .map((d) => ({
      name: SOURCE_LABELS[d.source] || d.source,
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
