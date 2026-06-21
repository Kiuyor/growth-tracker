import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/date";
import { StatsClient } from "./stats-client";
import { subDays, startOfDay } from "date-fns";
import type { OverviewStats, HeatmapData } from "@/types";
import { buildDailyBuckets, type RawDailyRecord } from "@/lib/aggregations";
import {
  buildTaskStatusCounts,
  buildTaskPriorityCounts,
  buildTaskCategoryCounts,
} from "@/lib/task-stats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数据统计 | 成长追踪",
  description: "查看任务、打卡、心情和番茄钟的详细统计数据",
};

export default async function StatsPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const userId = session.userId;
  const todayStart = startOfDay(new Date());
  const startDate = subDays(todayStart, 6);

  const [
    dailyChecks,
    pomodoros,
    moodEntries,
    taskStatusGroups,
    priorityGroups,
    categoryGroups,
    completedTasks,
    pointLogs,
    heatmapRecords,
  ] = await Promise.all([
    prisma.dailyCheck.findMany({
      where: { userId, date: { gte: startDate } },
      select: { date: true },
    }),
    prisma.pomodoro.findMany({
      where: {
        userId,
        startedAt: { gte: startDate },
        endedAt: { not: null },
      },
      select: { startedAt: true, duration: true },
    }),
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true, moodScore: true },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),
    prisma.task.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { priority: true },
    }),
    prisma.task.groupBy({
      by: ["category"],
      where: { userId, category: { not: null } },
      _count: { category: true },
    }),
    prisma.task.findMany({
      where: { userId, status: "DONE", updatedAt: { gte: startDate } },
      select: { updatedAt: true },
    }),
    prisma.pointLog.findMany({
      where: { userId, createdAt: { gte: startDate }, amount: { gt: 0 } },
      select: { source: true, amount: true, createdAt: true },
    }),
    prisma.dailyCheck.findMany({
      where: { userId },
      select: { date: true, streak: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const records: RawDailyRecord[] = [
    ...dailyChecks.map((c) => ({ date: c.date, checkIn: true })),
    ...pomodoros.map((p) => ({
      date: p.startedAt,
      pomodoroCount: 1,
      pomodoroMinutes: p.duration,
    })),
    ...moodEntries.map((e) => ({ date: e.createdAt, moodScore: e.moodScore })),
    ...completedTasks.map((t) => ({ date: t.updatedAt, tasksCompleted: 1 })),
    ...pointLogs.map((p) => ({ date: p.createdAt, pointsEarned: p.amount })),
  ];

  const daily = buildDailyBuckets(startDate, todayStart, records);

  const taskStatusCounts = buildTaskStatusCounts(
    taskStatusGroups as { status: string; _count: { status: number } }[]
  );

  const byPriority = buildTaskPriorityCounts(
    priorityGroups as { priority: string; _count: { priority: number } }[]
  );

  const byCategory = buildTaskCategoryCounts(
    categoryGroups as { category: string | null; _count: { category: number } }[]
  );

  const hourMap = new Map<number, number>();
  for (let i = 0; i < 24; i++) hourMap.set(i, 0);
  pomodoros.forEach((p) => {
    const hour = p.startedAt.getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  const pointsSourceMap = new Map<string, number>();
  pointLogs.forEach((p) => {
    pointsSourceMap.set(p.source, (pointsSourceMap.get(p.source) || 0) + p.amount);
  });

  const overview: OverviewStats = {
    daily,
    tasks: {
      total: taskStatusCounts.total,
      completed: taskStatusCounts.DONE,
      inProgress: taskStatusCounts.IN_PROGRESS,
      todo: taskStatusCounts.TODO,
      byPriority,
      byCategory,
    },
    pointsBySource: Array.from(pointsSourceMap.entries()).map(([source, amount]) => ({
      source: source as import("@/types").PointSource,
      amount,
    })),
    pomodoroByHour: Array.from(hourMap.entries()).map(([hour, count]) => ({
      hour,
      count,
    })),
  };

  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
  const heatmapData: HeatmapData = {
    year,
    data: [],
  };

  const recordMap = new Map<string, number>();
  heatmapRecords.forEach((r) => {
    const key = dayKey(r.date);
    recordMap.set(key, r.streak);
  });

  const current = new Date(yearStart);
  while (current <= yearEnd) {
    const key = dayKey(current);
    heatmapData.data.push({
      date: key,
      value: recordMap.has(key) ? 1 : 0,
      streak: recordMap.get(key) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return <StatsClient initialOverview={overview} initialHeatmap={heatmapData} />;
}
