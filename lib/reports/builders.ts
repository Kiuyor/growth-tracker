import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";
import { buildDailyBuckets, type RawDailyRecord } from "@/lib/aggregations";
import type { DailyStat } from "@/types";

export async function buildDailyStats(
  userId: string,
  start: Date,
  end: Date
): Promise<DailyStat[]> {
  const [dailyChecks, pomodoros, moodEntries, completedTasks, pointLogs] =
    await Promise.all([
      prisma.dailyCheck.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { date: true, streak: true },
      }),
      prisma.pomodoro.findMany({
        where: {
          userId,
          startedAt: { gte: start, lte: end },
          endedAt: { not: null },
        },
        select: { startedAt: true, duration: true },
      }),
      prisma.moodEntry.findMany({
        where: { userId, createdAt: { gte: start, lte: end } },
        select: { createdAt: true, moodScore: true },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: "DONE",
          updatedAt: { gte: start, lte: end },
        },
        select: { updatedAt: true },
      }),
      prisma.pointLog.findMany({
        where: {
          userId,
          createdAt: { gte: start, lte: end },
          amount: { gt: 0 },
        },
        select: { createdAt: true, amount: true },
      }),
    ]);

  const records: RawDailyRecord[] = [
    ...dailyChecks.map((c) => ({
      date: c.date,
      checkIn: true,
      streak: c.streak,
    })),
    ...pomodoros.map((p) => ({
      date: p.startedAt,
      pomodoroCount: 1,
      pomodoroMinutes: p.duration,
    })),
    ...moodEntries.map((e) => ({
      date: e.createdAt,
      moodScore: e.moodScore,
    })),
    ...completedTasks.map((t) => ({
      date: t.updatedAt,
      tasksCompleted: 1,
    })),
    ...pointLogs.map((p) => ({
      date: p.createdAt,
      pointsEarned: p.amount,
    })),
  ];

  return buildDailyBuckets(start, end, records);
}

export function summarize(daily: DailyStat[]) {
  let pomodoroMinutes = 0;
  let pomodoroCount = 0;
  let tasksCompleted = 0;
  let checkInDays = 0;
  let pointsEarned = 0;
  let moodSum = 0;
  let moodCount = 0;

  let mostFocusDay: { date: string; minutes: number } | null = null;
  let mostTasksDay: { date: string; count: number } | null = null;
  let bestMoodDay: { date: string; score: number } | null = null;

  daily.forEach((d) => {
    pomodoroMinutes += d.pomodoroMinutes;
    pomodoroCount += d.pomodoroCount;
    tasksCompleted += d.tasksCompleted;
    if (d.checkIn) checkInDays += 1;
    pointsEarned += d.pointsEarned;

    if (d.moodScore !== null) {
      moodSum += d.moodScore;
      moodCount += 1;
      if (!bestMoodDay || d.moodScore > bestMoodDay.score) {
        bestMoodDay = { date: d.date, score: d.moodScore };
      }
    }

    if (d.pomodoroMinutes > 0) {
      if (!mostFocusDay || d.pomodoroMinutes > mostFocusDay.minutes) {
        mostFocusDay = { date: d.date, minutes: d.pomodoroMinutes };
      }
    }

    if (d.tasksCompleted > 0) {
      if (!mostTasksDay || d.tasksCompleted > mostTasksDay.count) {
        mostTasksDay = { date: d.date, count: d.tasksCompleted };
      }
    }
  });

  return {
    pomodoroMinutes,
    pomodoroCount,
    tasksCompleted,
    checkInDays,
    moodAverage: moodCount > 0 ? Number((moodSum / moodCount).toFixed(1)) : null,
    pointsEarned,
    highlights: {
      mostFocusDay,
      mostTasksDay,
      bestMoodDay,
    },
  };
}

export async function getStreakAt(
  userId: string,
  date: Date
): Promise<number> {
  const record = await prisma.dailyCheck.findUnique({
    where: { userId_date: { userId, date } },
    select: { streak: true },
  });
  return record?.streak || 0;
}
