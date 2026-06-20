import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MoodClient } from "./mood-client";
import { getMoodStreak, hasMoodEntryToday } from "@/lib/mood-rules";
import { subDays } from "date-fns";

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

  return (
    <MoodClient
      initialEntries={entries.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      }))}
      initialStats={{
        totalEntries,
        currentStreak,
        averageMood,
        todayRecorded,
      }}
    />
  );
}
