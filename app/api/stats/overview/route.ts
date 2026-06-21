import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";
import type { OverviewStats } from "@/types";
import { withAuth } from "@/lib/api/with-auth";
import { buildDailyBuckets, type RawDailyRecord } from "@/lib/aggregations";
import {
  buildTaskStatusCounts,
  buildTaskPriorityCounts,
  buildTaskCategoryCounts,
} from "@/lib/task-stats";

// GET /api/stats/overview?days=7|30
export const GET = withAuth(async (userId, request) => {
  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") || "7", 10), 30);
  const now = new Date();
  const todayStart = startOfDay(now);
  const startDate = subDays(todayStart, days - 1);

  const [
    dailyChecks,
    pomodoros,
    moodEntries,
    completedTasks,
    pointLogs,
    taskStatusGroups,
    priorityGroups,
    categoryGroups,
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
    prisma.task.findMany({
      where: { userId, status: "DONE", updatedAt: { gte: startDate } },
      select: { updatedAt: true },
    }),
    prisma.pointLog.findMany({
      where: { userId, createdAt: { gte: startDate }, amount: { gt: 0 } },
      select: { source: true, amount: true, createdAt: true },
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

  // 任务统计（使用 groupBy 聚合结果，避免全量拉取到内存）
  const taskStatusCounts = buildTaskStatusCounts(
    taskStatusGroups as { status: string; _count: { status: number } }[]
  );

  const byPriority = buildTaskPriorityCounts(
    priorityGroups as { priority: string; _count: { priority: number } }[]
  );

  const byCategory = buildTaskCategoryCounts(
    categoryGroups as { category: string | null; _count: { category: number } }[]
  );

  // 番茄钟时段分布
  const hourMap = new Map<number, number>();
  for (let i = 0; i < 24; i++) hourMap.set(i, 0);
  pomodoros.forEach((p) => {
    const hour = p.startedAt.getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  // 积分来源
  const pointsSourceMap = new Map<string, number>();
  pointLogs.forEach((p) => {
    pointsSourceMap.set(p.source, (pointsSourceMap.get(p.source) || 0) + p.amount);
  });

  const result: OverviewStats = {
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

  return NextResponse.json(result);
});
