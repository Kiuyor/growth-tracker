import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";
import { checkPurchaseLimit } from "@/lib/shop-rules";
import { withAuth } from "@/lib/api/with-auth";

// POST /api/shop/purchase
export const POST = withAuth(async (userId, request) => {
  const body = await request.json();
  const { shopItemId } = body;

  if (!shopItemId) {
    return NextResponse.json({ error: "Missing shopItemId" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const shopItem = await tx.shopItem.findUnique({
        where: { id: shopItemId },
      });

      if (!shopItem || !shopItem.isActive) {
        throw new Error("SHOP_ITEM_NOT_FOUND");
      }

      const user = await tx.userProfile.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (user.totalPoints < shopItem.cost) {
        throw new Error("INSUFFICIENT_POINTS");
      }

      const limitCheck = await checkPurchaseLimit(
        tx,
        userId,
        shopItem
      );
      if (!limitCheck.allowed) {
        throw new Error("PURCHASE_LIMIT_REACHED");
      }

      // 扣积分
      const pointResult = await addPoints({
        userId,
        amount: -shopItem.cost,
        source: "SHOP_SPEND",
        sourceId: shopItem.id,
        description: `兑换了「${shopItem.name}」`,
        tx,
      });

      // 创建库存记录
      const userItem = await tx.userItem.create({
        data: {
          userId,
          shopItemId: shopItem.id,
          status: "UNUSED",
        },
        include: { shopItem: true },
      });

      return {
        userItem,
        balance: pointResult.balance,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    logger.error("Purchase error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "SHOP_ITEM_NOT_FOUND") {
      return NextResponse.json({ error: "商品不存在或已下架" }, { status: 404 });
    }
    if (message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    if (message === "INSUFFICIENT_POINTS") {
      return NextResponse.json({ error: "积分不足" }, { status: 400 });
    }
    if (message === "PURCHASE_LIMIT_REACHED") {
      return NextResponse.json({ error: "已达到本期兑换上限" }, { status: 400 });
    }
    return NextResponse.json({ error: "兑换失败" }, { status: 500 });
  }
});
