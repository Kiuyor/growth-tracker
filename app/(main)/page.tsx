import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { startOfDay, subDays } from "date-fns";
import { buildDailyBuckets, type RawDailyRecord } from "@/lib/aggregations";
import { mapTask } from "@/lib/mappers";
import { StatCards } from "./dashboard/components/stat-cards";
import { WeeklyChartSection } from "./dashboard/components/weekly-chart-section";
import { RecentTasks } from "./dashboard/components/recent-tasks";

export const metadata: Metadata = {
  title: "仪表盘 | 成长追踪",
  description: "查看你的成长数据概览，包括任务、打卡、心情和番茄钟统计",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const userId = session.userId;
  const today = startOfDay(new Date());

  const [
    profile,
    totalTasks,
    pendingTasks,
    completedTasks,
    inProgressTasks,
    todayCheck,
    yesterdayCheck,
    todayPomodoroCount,
    todayPomodoroMinutes,
    todayMood,
    weeklyPomodoros,
    weeklyMoods,
    recentTasks,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { clerkId: userId } }),
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: { not: "DONE" } } }),
    prisma.task.count({ where: { userId, status: "DONE" } }),
    prisma.task.count({ where: { userId, status: "IN_PROGRESS" } }),
    prisma.dailyCheck.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
    prisma.dailyCheck.findUnique({
      where: { userId_date: { userId, date: subDays(today, 1) } },
    }),
    prisma.pomodoro.count({
      where: { userId, startedAt: { gte: today }, endedAt: { not: null } },
    }),
    prisma.pomodoro.aggregate({
      where: { userId, startedAt: { gte: today }, endedAt: { not: null } },
      _sum: { duration: true },
    }),
    prisma.moodEntry.findFirst({
      where: { userId, createdAt: { gte: today } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pomodoro.findMany({
      where: {
        userId,
        startedAt: { gte: subDays(today, 6) },
        endedAt: { not: null },
      },
      select: { startedAt: true, duration: true },
    }),
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: subDays(today, 6) } },
      select: { createdAt: true, moodScore: true },
    }),
    prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { subtasks: true },
    }),
  ]);

  const streak = todayCheck
    ? todayCheck.streak
    : yesterdayCheck
    ? yesterdayCheck.streak
    : 0;

  const rawRecords: RawDailyRecord[] = [
    ...weeklyPomodoros.map((p) => ({
      date: p.startedAt,
      pomodoroCount: 1,
      pomodoroMinutes: p.duration,
    })),
    ...weeklyMoods.map((e) => ({ date: e.createdAt, moodScore: e.moodScore })),
  ];

  const weeklyDaily = buildDailyBuckets(subDays(today, 6), today, rawRecords);

  const taskStatusCounts = {
    TODO: pendingTasks - inProgressTasks,
    IN_PROGRESS: inProgressTasks,
    DONE: completedTasks,
  };

  return (
    <div className="flex h-full flex-col gap-3 md:gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold md:text-2xl">仪表盘</h2>
        <Link href="/stats">
          <Button variant="outline" size="sm">查看完整统计</Button>
        </Link>
      </div>

      <StatCards
        totalPoints={profile?.totalPoints || 0}
        streak={streak}
        todayCheck={!!todayCheck}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        todayPomodoroCount={todayPomodoroCount}
        todayPomodoroMinutes={todayPomodoroMinutes._sum.duration || 0}
        todayMood={todayMood}
      />

      <WeeklyChartSection
        weeklyDaily={weeklyDaily}
        taskStatusCounts={taskStatusCounts}
      />

      <RecentTasks tasks={recentTasks.map(mapTask)} />
    </div>
  );
}
