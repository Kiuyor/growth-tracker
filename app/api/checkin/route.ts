import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";
import {
  CHECK_IN_BASE_POINTS,
  getMilestoneBonus,
} from "@/lib/check-in-rules";
import { startOfDay, subDays } from "date-fns";
import { withAuth } from "@/lib/api/with-auth";

// POST /api/checkin
export const POST = withAuth(async (userId) => {
  const today = startOfDay(new Date());

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 幂等检查
      const existing = await tx.dailyCheck.findUnique({
        where: { userId_date: { userId, date: today } },
      });

      if (existing) {
        throw new Error("ALREADY_CHECKED_IN");
      }

      // 查询昨日记录，计算连续天数
      const yesterday = subDays(today, 1);
      const yesterdayCheck = await tx.dailyCheck.findUnique({
        where: { userId_date: { userId, date: yesterday } },
      });

      const streak = yesterdayCheck ? yesterdayCheck.streak + 1 : 1;

      // 创建打卡记录
      const dailyCheck = await tx.dailyCheck.create({
        data: { userId, date: today, checked: true, streak },
      });

      // 基础积分
      await addPoints({
        userId,
        amount: CHECK_IN_BASE_POINTS,
        source: "DAILY_CHECK",
        sourceId: dailyCheck.id,
        description: "每日打卡",
        tx,
      });

      // 里程碑奖励
      const milestone = getMilestoneBonus(streak);
      if (milestone) {
        await addPoints({
          userId,
          amount: milestone.bonus,
          source: "STREAK_BONUS",
          sourceId: dailyCheck.id,
          description: `${milestone.label} 连续打卡奖励`,
          tx,
        });
      }

      return {
        dailyCheck,
        basePoints: CHECK_IN_BASE_POINTS,
        milestone: milestone
          ? { days: milestone.days, bonus: milestone.bonus, label: milestone.label }
          : null,
        totalPoints: CHECK_IN_BASE_POINTS + (milestone?.bonus || 0),
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    logger.error("Check-in error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "ALREADY_CHECKED_IN") {
      return NextResponse.json({ error: "今日已打卡" }, { status: 409 });
    }
    return NextResponse.json({ error: "打卡失败" }, { status: 500 });
  }
});
