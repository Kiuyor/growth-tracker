import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatsClient } from "./stats-client";
import { subDays, startOfDay, format } from "date-fns";
import type { OverviewStats, HeatmapData } from "@/types";

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
    allTasks,
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
    prisma.task.findMany({
      where: { userId },
      select: { status: true, priority: true, category: true },
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

  const dailyMap = new Map<
    string,
    {
      checkIn: boolean;
      pomodoroCount: number;
      pomodoroMinutes: number;
      moodScores: number[];
      tasksCompleted: number;
      pointsEarned: number;
    }
  >();

  for (let i = 0; i < 7; i++) {
    const d = subDays(todayStart, 6 - i);
    dailyMap.set(format(d, "yyyy-MM-dd"), {
      checkIn: false,
      pomodoroCount: 0,
      pomodoroMinutes: 0,
      moodScores: [],
      tasksCompleted: 0,
      pointsEarned: 0,
    });
  }

  dailyChecks.forEach((c) => {
    const key = format(c.date, "yyyy-MM-dd");
    const day = dailyMap.get(key);
    if (day) day.checkIn = true;
  });

  pomodoros.forEach((p) => {
    const key = format(p.startedAt, "yyyy-MM-dd");
    const day = dailyMap.get(key);
    if (day) {
      day.pomodoroCount += 1;
      day.pomodoroMinutes += p.duration;
    }
  });

  moodEntries.forEach((e) => {
    const key = format(e.createdAt, "yyyy-MM-dd");
    const day = dailyMap.get(key);
    if (day) day.moodScores.push(e.moodScore);
  });

  completedTasks.forEach((t) => {
    const key = format(t.updatedAt, "yyyy-MM-dd");
    const day = dailyMap.get(key);
    if (day) day.tasksCompleted += 1;
  });

  pointLogs.forEach((p) => {
    const key = format(p.createdAt, "yyyy-MM-dd");
    const day = dailyMap.get(key);
    if (day) day.pointsEarned += p.amount;
  });

  const daily = Array.from(dailyMap.entries()).map(([date, val]) => ({
    date,
    checkIn: val.checkIn,
    pomodoroCount: val.pomodoroCount,
    pomodoroMinutes: val.pomodoroMinutes,
    moodScore:
      val.moodScores.length > 0
        ? Number(
            (val.moodScores.reduce((a, b) => a + b, 0) / val.moodScores.length).toFixed(1)
          )
        : null,
    tasksCompleted: val.tasksCompleted,
    pointsEarned: val.pointsEarned,
  }));

  const taskStatusCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  const priorityMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();

  allTasks.forEach((t) => {
    if (t.status === "TODO" || t.status === "IN_PROGRESS" || t.status === "DONE") {
      taskStatusCounts[t.status] += 1;
    }
    priorityMap.set(t.priority, (priorityMap.get(t.priority) || 0) + 1);
    if (t.category) {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + 1);
    }
  });

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
      total: allTasks.length,
      completed: taskStatusCounts.DONE,
      inProgress: taskStatusCounts.IN_PROGRESS,
      todo: taskStatusCounts.TODO,
      byPriority: Array.from(priorityMap.entries()).map(([priority, count]) => ({
        priority,
        count,
      })),
      byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      })),
    },
    pointsBySource: Array.from(pointsSourceMap.entries()).map(([source, amount]) => ({
      source,
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
    const key = r.date.toISOString().split("T")[0];
    recordMap.set(key, r.streak);
  });

  const current = new Date(yearStart);
  while (current <= yearEnd) {
    const key = current.toISOString().split("T")[0];
    heatmapData.data.push({
      date: key,
      value: recordMap.has(key) ? 1 : 0,
      streak: recordMap.get(key) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return <StatsClient initialOverview={overview} initialHeatmap={heatmapData} />;
}
