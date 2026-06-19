import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addPoints } from "@/lib/points-engine";
import { checkPurchaseLimit } from "@/lib/shop-rules";

// POST /api/shop/purchase
export async function POST(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
        return { error: "商品不存在或已下架", status: 404 };
      }

      const user = await tx.userProfile.findUnique({
        where: { clerkId: session.userId },
      });

      if (!user) {
        return { error: "用户不存在", status: 404 };
      }

      if (user.totalPoints < shopItem.cost) {
        return { error: "积分不足", status: 400 };
      }

      const limitCheck = await checkPurchaseLimit(
        tx,
        session.userId,
        shopItem
      );
      if (!limitCheck.allowed) {
        return { error: "已达到本期兑换上限", status: 400 };
      }

      // 扣积分
      const pointResult = await addPoints({
        userId: session.userId,
        amount: -shopItem.cost,
        source: "SHOP_SPEND",
        sourceId: shopItem.id,
        description: `兑换了「${shopItem.name}」`,
      });

      // 创建库存记录
      const userItem = await tx.userItem.create({
        data: {
          userId: session.userId,
          shopItemId: shopItem.id,
          status: "UNUSED",
        },
        include: { shopItem: true },
      });

      return {
        userItem,
        balance: pointResult.balance,
        status: 200,
      };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Purchase error:", err);
    return NextResponse.json({ error: "兑换失败" }, { status: 500 });
  }
}
