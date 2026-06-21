import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MoodClient } from "./mood-client";
import { getMoodStreak, hasMoodEntryToday, tagsToArray } from "@/lib/mood-rules";
import { subDays } from "date-fns";
import type { MoodEntry } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "心情记录 | 成长追踪",
  description: "记录每日心情，追踪情绪变化趋势",
};

export default async function MoodPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const userId = session.userId;
  const now = new Date();
  const weekAgo = subDays(now, 7);

  const [entries, totalEntries, currentStreak, todayRecorded, weekEntries] =
    await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.moodEntry.count({ where: { userId } }),
      getMoodStreak(userId),
      hasMoodEntryToday(userId),
      prisma.moodEntry.findMany({
        where: {
          userId,
          createdAt: { gte: weekAgo },
        },
        select: { moodScore: true },
      }),
    ]);

  const averageMood =
    weekEntries.length > 0
      ? Number(
          (
            weekEntries.reduce((sum, e) => sum + e.moodScore, 0) /
            weekEntries.length
          ).toFixed(1)
        )
      : 0;

  const initialEntries: MoodEntry[] = entries.map((e) => ({
    ...e,
    tags: tagsToArray(e.tags),
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <MoodClient
      initialEntries={initialEntries}
      initialStats={{
        totalEntries,
        currentStreak,
        averageMood,
        todayRecorded,
      }}
    />
  );
}
