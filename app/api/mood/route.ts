import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";
import {
  tagsToString,
  tagsToArray,
  getMoodStreak,
  hasMoodEntryToday,
  calcMoodPoints,
} from "@/lib/mood-rules";
import type { MoodEntry } from "@/types";
import { withAuth } from "@/lib/api/with-auth";

// POST /api/mood - 创建心情随记
export const POST = withAuth(async (userId, request) => {
  const body = await request.json();
  const { content, moodScore, tags } = body as {
    content?: string;
    moodScore?: number;
    tags?: string[];
  };

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "内容不能为空" },
      { status: 400 }
    );
  }

  if (content.length > 500) {
    return NextResponse.json(
      { error: "内容不能超过 500 字" },
      { status: 400 }
    );
  }

  if (!moodScore || moodScore < 1 || moodScore > 5 || !Number.isInteger(moodScore)) {
    return NextResponse.json(
      { error: "心情评分必须是 1-5 的整数" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const firstToday = !(await hasMoodEntryToday(userId, tx));

      const entry = await tx.moodEntry.create({
        data: {
          userId,
          content: content.trim(),
          moodScore,
          tags: tagsToString(tags || []),
        },
      });

      const streak = await getMoodStreak(userId, tx);
      const { base, streak: streakBonus } = calcMoodPoints(firstToday, streak);

      if (base > 0) {
        await addPoints({
          userId,
          amount: base,
          source: "MOOD_ENTRY",
          sourceId: entry.id,
          description: "心情随记",
          tx,
        });
      }

      if (streakBonus > 0) {
        await addPoints({
          userId,
          amount: streakBonus,
          source: "MOOD_STREAK",
          sourceId: entry.id,
          description: `连续 ${streak} 天心情记录奖励`,
          tx,
        });
      }

      return {
        entry,
        basePoints: base,
        streakBonus,
        streak,
        totalPoints: base + streakBonus,
      };
    });

    return NextResponse.json({
      entry: {
        ...result.entry,
        tags: tagsToArray(result.entry.tags),
        createdAt: result.entry.createdAt.toISOString(),
      } satisfies MoodEntry,
      basePoints: result.basePoints,
      streakBonus: result.streakBonus,
      streak: result.streak,
      totalPoints: result.totalPoints,
    }, { status: 201 });
  } catch (err) {
    logger.error("Mood entry error:", err);
    return NextResponse.json({ error: "记录失败" }, { status: 500 });
  }
});

// GET /api/mood - 获取历史列表
export const GET = withAuth(async (userId, request) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const [entries, total] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.moodEntry.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    entries: entries.map((e) => ({
      ...e,
      tags: tagsToArray(e.tags),
      createdAt: e.createdAt.toISOString(),
    })) satisfies MoodEntry[],
    total,
  });
});
