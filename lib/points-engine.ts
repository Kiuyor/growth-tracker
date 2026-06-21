import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { DEFAULT_POINT_LOG_LIMIT } from "./constants";
import type { PointSource } from "@/types";

export type { PointSource };
interface AddPointsParams {
  userId: string;
  amount: number;
  source: PointSource;
  sourceId?: string;
  description: string;
  tx?: Prisma.TransactionClient;
}

async function addPointsInner(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  source: PointSource,
  sourceId: string | undefined,
  description: string
) {
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
}

export async function addPoints({
  userId,
  amount,
  source,
  sourceId,
  description,
  tx,
}: AddPointsParams) {
  if (tx) {
    return addPointsInner(tx, userId, amount, source, sourceId, description);
  }

  return prisma.$transaction(async (innerTx) => {
    return addPointsInner(innerTx, userId, amount, source, sourceId, description);
  });
}

export async function getUserBalance(userId: string) {
  const user = await prisma.userProfile.findUnique({
    where: { clerkId: userId },
    select: { totalPoints: true },
  });

  return user?.totalPoints ?? 0;
}

export async function getPointLogs(userId: string, limit = DEFAULT_POINT_LOG_LIMIT) {
  return prisma.pointLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
