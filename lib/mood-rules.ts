import { prisma } from "./prisma";
import { startOfDay, subDays, isSameDay } from "date-fns";
import type { PrismaClient } from "@prisma/client";

export const MOOD_ENTRY_POINTS = 3;
export const MOOD_STREAK_BONUS = 10;
export const MOOD_STREAK_MILESTONE = 7;

export function tagsToString(tags: string[]): string {
  return tags
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join(",");
}

export function tagsToArray(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

type PrismaLike = PrismaClient | Pick<PrismaClient, "moodEntry" >;

export async function getMoodStreak(
  userId: string,
  client: PrismaLike = prisma
): Promise<number> {
  const entries = await client.moodEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (entries.length === 0) return 0;

  const today = startOfDay(new Date());
  const latest = startOfDay(entries[0].createdAt);

  // 如果最新记录不是今天或昨天，说明已经断签
  if (
    !isSameDay(latest, today) &&
    !isSameDay(latest, subDays(today, 1))
  ) {
    return 0;
  }

  let streak = 1;
  const dates = entries.map((e) => startOfDay(e.createdAt).getTime());
  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);

  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i - 1]);
    if (isSameDay(current, subDays(previous, 1))) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function hasMoodEntryToday(
  userId: string,
  client: PrismaLike = prisma
): Promise<boolean> {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await client.moodEntry.count({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return count > 0;
}

export function calcMoodPoints(
  isFirstToday: boolean,
  streakAfterRecord: number
): { base: number; streak: number } {
  const base = isFirstToday ? MOOD_ENTRY_POINTS : 0;
  const streak =
    streakAfterRecord > 0 && streakAfterRecord % MOOD_STREAK_MILESTONE === 0
      ? MOOD_STREAK_BONUS
      : 0;
  return { base, streak };
}

export const MOOD_EMOJIS = ["😫", "😟", "😐", "🙂", "😄"];

export function getMoodLabel(score: number): string {
  const labels: Record<number, string> = {
    1: "很糟糕",
    2: "不太好",
    3: "一般",
    4: "不错",
    5: "很棒",
  };
  return labels[score] || "一般";
}

export const MOOD_PRESET_TAGS = [
  "开心",
  "疲惫",
  "焦虑",
  "充实",
  "平静",
  "期待",
  "失落",
  "感恩",
];
