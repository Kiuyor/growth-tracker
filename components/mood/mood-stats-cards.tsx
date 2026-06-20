"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookHeart, Flame, TrendingUp, CalendarCheck } from "lucide-react";
import type { MoodStats } from "@/types";

interface MoodStatsCardProps {
  stats: MoodStats;
}

export function MoodStatsCards({ stats }: MoodStatsCardProps) {
  const items = [
    {
      label: "总记录",
      value: `${stats.totalEntries} 条`,
      icon: BookHeart,
      color: "text-pink-600 dark:text-pink-400",
    },
    {
      label: "连续记录",
      value: `${stats.currentStreak} 天`,
      icon: Flame,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "近 7 天平均",
      value: stats.averageMood > 0 ? `${stats.averageMood} 分` : "暂无",
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "今日状态",
      value: stats.todayRecorded ? "已记录" : "未记录",
      icon: CalendarCheck,
      color: stats.todayRecorded
        ? "text-green-600 dark:text-green-400"
        : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
