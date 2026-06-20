import { prisma } from "@/lib/prisma";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import type { ReportStats, DailyStat } from "@/types";

function getPeriod(
  type: "weekly" | "monthly",
  offset: number,
  anchor: Date = new Date()
) {
  const currentAnchor =
    type === "weekly" ? addWeeks(anchor, offset) : addMonths(anchor, offset);

  const start =
    type === "weekly"
      ? startOfWeek(currentAnchor, { weekStartsOn: 1 })
      : startOfMonth(currentAnchor);

  const end =
    type === "weekly"
      ? endOfWeek(currentAnchor, { weekStartsOn: 1 })
      : endOfMonth(currentAnchor);

  let label: string;
  if (type === "weekly") {
    const weekNum = Math.ceil(start.getDate() / 7);
    label = `${format(start, "M月")}第${weekNum}周 (${format(start, "MM.dd")}-${format(end, "MM.dd")})`;
  } else {
    label = format(start, "yyyy年M月", { locale: zhCN });
  }

  return { start, end, label };
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function buildDailyStats(
  userId: string,
  start: Date,
  end: Date
): Promise<DailyStat[]> {
  const days = eachDayOfInterval({ start, end });

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

  const dailyMap = new Map<
    string,
    {
      checkIn: boolean;
      pomodoroCount: number;
      pomodoroMinutes: number;
      moodScores: number[];
      tasksCompleted: number;
      pointsEarned: number;
      streak: number;
    }
  >();

  days.forEach((d) => {
    const key = format(d, "yyyy-MM-dd");
    dailyMap.set(key, {
      checkIn: false,
      pomodoroCount: 0,
      pomodoroMinutes: 0,
      moodScores: [],
      tasksCompleted: 0,
      pointsEarned: 0,
      streak: 0,
    });
  });

  dailyChecks.forEach((c) => {
    const key = format(c.date, "yyyy-MM-dd");
    const day = dailyMap.get(key);
    if (day) {
      day.checkIn = true;
      day.streak = c.streak;
    }
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

  return Array.from(dailyMap.entries()).map(([date, val]) => ({
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
    streak: val.streak,
  }));
}

function summarize(daily: DailyStat[]) {
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

async function getStreakAt(userId: string, date: Date): Promise<number> {
  const record = await prisma.dailyCheck.findUnique({
    where: { userId_date: { userId, date } },
    select: { streak: true },
  });
  return record?.streak || 0;
}

export async function buildReportStats(
  userId: string,
  type: "weekly" | "monthly",
  offset: number
): Promise<ReportStats> {
  const currentPeriod = getPeriod(type, offset);
  const previousPeriod = getPeriod(type, offset - 1);

  const [currentDaily, previousDaily, streakStart] = await Promise.all([
    buildDailyStats(userId, currentPeriod.start, currentPeriod.end),
    buildDailyStats(userId, previousPeriod.start, previousPeriod.end),
    getStreakAt(userId, subDays(currentPeriod.start, 1)),
  ]);

  const currentSummary = summarize(currentDaily);
  const previousSummary = summarize(previousDaily);

  const lastDayWithStreak = [...currentDaily]
    .reverse()
    .find((d) => (d.streak || 0) > 0);
  const streakEnd = lastDayWithStreak?.streak ?? streakStart;

  return {
    type,
    current: {
      start: format(currentPeriod.start, "yyyy-MM-dd"),
      end: format(currentPeriod.end, "yyyy-MM-dd"),
      label: currentPeriod.label,
    },
    previous: {
      start: format(previousPeriod.start, "yyyy-MM-dd"),
      end: format(previousPeriod.end, "yyyy-MM-dd"),
      label: previousPeriod.label,
    },
    summary: {
      pomodoroMinutes: currentSummary.pomodoroMinutes,
      pomodoroCount: currentSummary.pomodoroCount,
      tasksCompleted: currentSummary.tasksCompleted,
      checkInDays: currentSummary.checkInDays,
      moodAverage: currentSummary.moodAverage,
      pointsEarned: currentSummary.pointsEarned,
    },
    comparison: {
      pomodoroMinutes: percentChange(
        currentSummary.pomodoroMinutes,
        previousSummary.pomodoroMinutes
      ),
      pomodoroCount: percentChange(
        currentSummary.pomodoroCount,
        previousSummary.pomodoroCount
      ),
      tasksCompleted: percentChange(
        currentSummary.tasksCompleted,
        previousSummary.tasksCompleted
      ),
      checkInDays: percentChange(
        currentSummary.checkInDays,
        previousSummary.checkInDays
      ),
      moodAverage:
        currentSummary.moodAverage !== null &&
        previousSummary.moodAverage !== null
          ? Number(
              (currentSummary.moodAverage - previousSummary.moodAverage).toFixed(1)
            )
          : null,
      pointsEarned: percentChange(
        currentSummary.pointsEarned,
        previousSummary.pointsEarned
      ),
    },
    streak: {
      start: streakStart,
      end: streakEnd,
      change: streakEnd - streakStart,
    },
    highlights: currentSummary.highlights,
    daily: currentDaily,
  };
}
