"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Timer } from "lucide-react";
import type { PomodoroStats } from "@/types";

interface PomodoroStatsProps {
  stats: PomodoroStats | null;
}

export function PomodoroStats({ stats }: PomodoroStatsProps) {
  const items = [
    { label: "今日专注", value: `${stats?.todayCount ?? 0} 次` },
    { label: "今日时长", value: `${stats?.todayMinutes ?? 0} 分钟` },
    { label: "本周时长", value: `${stats?.weekMinutes ?? 0} 分钟` },
    { label: "累计完成", value: `${stats?.totalCount ?? 0} 次` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Timer className="h-3.5 w-3.5" />
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
