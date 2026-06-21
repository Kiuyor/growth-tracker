"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonBadge } from "./comparison-badge";
import type { ReportStats } from "@/types";
import {
  Timer,
  ListTodo,
  CheckCircle2,
  Flame,
  Smile,
  Trophy,
} from "lucide-react";

interface StatGridProps {
  stats: ReportStats;
}

export function StatGrid({ stats }: StatGridProps) {
  const { summary, comparison } = stats;

  const statCards = [
    {
      title: "专注时长",
      value: `${summary.pomodoroMinutes}m`,
      compare: comparison.pomodoroMinutes,
      icon: Timer,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "专注次数",
      value: `${summary.pomodoroCount}`,
      compare: comparison.pomodoroCount,
      icon: ListTodo,
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "完成任务",
      value: `${summary.tasksCompleted}`,
      compare: comparison.tasksCompleted,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "打卡天数",
      value: `${summary.checkInDays}`,
      compare: comparison.checkInDays,
      icon: Flame,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "心情均分",
      value: summary.moodAverage !== null ? `${summary.moodAverage}` : "-",
      compare: comparison.moodAverage,
      icon: Smile,
      color: "text-pink-600 dark:text-pink-400",
      suffix: "分",
    },
    {
      title: "获得积分",
      value: `${summary.pointsEarned}`,
      compare: comparison.pointsEarned,
      icon: Trophy,
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={cn("flex items-center gap-2 text-xl font-bold", stat.color)}>
                <Icon className="h-4 w-4" />
                {stat.value}
                {stat.suffix && <span className="text-sm font-normal">{stat.suffix}</span>}
              </div>
              <div className="mt-1">
                <ComparisonBadge value={stat.compare} suffix={stat.suffix ? "" : "%"} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
