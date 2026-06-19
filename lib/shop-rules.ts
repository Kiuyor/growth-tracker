import { Prisma } from "@prisma/client";

export type ShopItemType = "REWARD" | "DECORATION" | "CONSUMABLE";
export type LimitPeriod = "WEEKLY" | "MONTHLY" | "TOTAL";

export interface LimitConfig {
  period: LimitPeriod;
  maxCount: number;
}

export const shopItemTypeLabel: Record<ShopItemType, string> = {
  REWARD: "奖励",
  DECORATION: "装扮",
  CONSUMABLE: "消耗品",
};

export function parseLimitConfig(
  limitConfig: string | null | undefined
): LimitConfig | null {
  if (!limitConfig) return null;
  try {
    const parsed = JSON.parse(limitConfig) as LimitConfig;
    if (
      ["WEEKLY", "MONTHLY", "TOTAL"].includes(parsed.period) &&
      typeof parsed.maxCount === "number" &&
      parsed.maxCount > 0
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function stringifyLimitConfig(config: LimitConfig): string {
  return JSON.stringify(config);
}

function getPeriodStart(period: LimitPeriod): Date {
  const now = new Date();

  if (period === "WEEKLY") {
    // 本周一 00:00（按中国习惯，周一为一周开始）
    const day = now.getDay(); // 0=周日, 1=周一
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  if (period === "MONTHLY") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // TOTAL
  return new Date(0);
}

export async function checkPurchaseLimit(
  tx: Prisma.TransactionClient,
  userId: string,
  shopItem: { id: string; limitConfig: string | null }
): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const config = parseLimitConfig(shopItem.limitConfig);
  if (!config) {
    return { allowed: true, current: 0, max: null };
  }

  const startDate = getPeriodStart(config.period);
  const count = await tx.userItem.count({
    where: {
      userId,
      shopItemId: shopItem.id,
      createdAt: { gte: startDate },
    },
  });

  return {
    allowed: count < config.maxCount,
    current: count,
    max: config.maxCount,
  };
}

export function formatLimitText(config: LimitConfig | null): string {
  if (!config) return "无限兑换";
  const periodText = {
    WEEKLY: "每周",
    MONTHLY: "每月",
    TOTAL: "总计",
  }[config.period];
  return `${periodText}限兑 ${config.maxCount} 次`;
}
