import { prisma } from "./prisma";

export type PointSource =
  | "TASK_COMPLETE"
  | "DAILY_CHECK"
  | "POMODORO"
  | "ACHIEVEMENT"
  | "STREAK_BONUS"
  | "SHOP_SPEND"
  | "MANUAL_ADJUST";

interface AddPointsParams {
  userId: string;
  amount: number;
  source: PointSource;
  sourceId?: string;
  description: string;
}

export async function addPoints({
  userId,
  amount,
  source,
  sourceId,
  description,
}: AddPointsParams) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = user.totalPoints + amount;

    await tx.userProfile.update({
      where: { clerkId: userId },
      data: { totalPoints: newBalance },
    });

    const log = await tx.pointLog.create({
      data: {
        userId,
        amount,
        balance: newBalance,
        source,
        sourceId,
        description,
      },
    });

    return { balance: newBalance, log };
  });
}

export async function getUserBalance(userId: string) {
  const user = await prisma.userProfile.findUnique({
    where: { clerkId: userId },
    select: { totalPoints: true },
  });

  return user?.totalPoints ?? 0;
}

export async function getPointLogs(userId: string, limit = 50) {
  return prisma.pointLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
