import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import type { OverviewStats } from "@/types";

// GET /api/stats/overview?days=7|30
export async function GET(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.userId;
  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") || "7", 10), 30);
  const now = new Date();
  const todayStart = startOfDay(now);
  const startDate = subDays(todayStart, days - 1);

  const [
    dailyChecks,
    pomodoros,
    moodEntries,
    tasks,
    completedTasks,
    pointLogs,
    allTasks,
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
    prisma.task.findMany({
      where: { userId },
      select: { status: true, priority: true, category: true },
    }),
  ]);

  // 初始化每日聚合
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

  for (let i = 0; i < days; i++) {
    const d = subDays(todayStart, days - 1 - i);
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

  // 任务统计
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

  return NextResponse.json(result);
}
