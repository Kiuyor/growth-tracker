"use client";

import { useMemo } from "react";
import type { ReportStats } from "@/types";

const labels = {
  weekly: { singular: "周", this: "本周", prev: "上周", next: "下周" },
  monthly: { singular: "月", this: "本月", prev: "上月", next: "下月" },
};

interface SummaryTextProps {
  data: ReportStats;
}

export function SummaryText({ data }: SummaryTextProps) {
  const text = useMemo(() => {
    const { summary, comparison, streak, type } = data;
    const period = labels[type].singular;
    const focusText = `${period}共专注了 ${summary.pomodoroMinutes} 分钟`;
    const taskText = `完成了 ${summary.tasksCompleted} 个任务`;
    const taskCompare =
      comparison.tasksCompleted > 0
        ? `比上${period}增长了 ${comparison.tasksCompleted}%`
        : comparison.tasksCompleted < 0
        ? `比上${period}下降了 ${Math.abs(comparison.tasksCompleted)}%`
        : `与上${period}持平`;
    const streakText =
      streak.change > 0
        ? `连续打卡天数从 ${streak.start} 天提升到了 ${streak.end} 天`
        : streak.change < 0
        ? `连续打卡天数从 ${streak.start} 天下降到了 ${streak.end} 天`
        : `连续打卡天数保持在 ${streak.end} 天`;

    let moodText = "";
    if (summary.moodAverage !== null) {
      moodText = `，心情平均分 ${summary.moodAverage} 分`;
    }

    return `${focusText}，${taskText}，${taskCompare}${moodText}。${streakText}。`;
  }, [data]);

  return <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>;
}
