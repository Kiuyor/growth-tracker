import { format, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { ReportStats } from "@/types";
import { getPeriod, percentChange } from "./period";
import { buildDailyStats, summarize, getStreakAt } from "./builders";

export function generateShareQuote(data: ReportStats): string {
  const { summary, streak, type } = data;
  const period = type === "weekly" ? "周" : "月";

  const templates = [
    {
      condition: () => summary.tasksCompleted > 0 && summary.pomodoroMinutes > 0,
      text: `本${period}专注了 ${summary.pomodoroMinutes} 分钟，完成了 ${summary.tasksCompleted} 个任务，继续保持！`,
    },
    {
      condition: () => streak.change > 0,
      text: `连续打卡天数提升了 ${streak.change} 天，坚持就是胜利！`,
    },
    {
      condition: () => summary.moodAverage !== null && summary.moodAverage >= 4,
      text: `心情保持不错，本${period}平均分 ${summary.moodAverage} 分，继续加油！`,
    },
    {
      condition: () => summary.pomodoroMinutes > 0,
      text: `本${period}专注了 ${summary.pomodoroMinutes} 分钟，每一步都算数。`,
    },
    {
      condition: () => summary.tasksCompleted > 0,
      text: `完成了 ${summary.tasksCompleted} 个任务，新${period}继续向前！`,
    },
  ];

  const matched = templates.find((t) => t.condition());
  return matched ? matched.text : `新${period}的开始，从专注一件事做起。`;
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

export { getPeriod, percentChange } from "./period";
export { buildDailyStats, summarize, getStreakAt } from "./builders";
