import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

// PATCH /api/shop/inventory/[id]/use
export const PATCH = withAuth(async (userId, request, { params }) => {
  const { id } = await params;
  const body = await request.json();
  const { note } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const userItem = await tx.userItem.findFirst({
        where: { id, userId },
        include: { shopItem: true },
      });

      if (!userItem) {
        throw new Error("ITEM_NOT_FOUND");
      }

      if (userItem.status !== "UNUSED") {
        throw new Error("ITEM_STATUS_INVALID");
      }

      const updated = await tx.userItem.update({
        where: { id },
        data: {
          status: "USED",
          usedAt: new Date(),
        },
        include: { shopItem: true },
      });

      const useLog = await tx.inventoryUseLog.create({
        data: {
          userItemId: id,
          note: note?.trim() || null,
        },
      });

      return { userItem: updated, useLog };
    });

    return NextResponse.json(result);
  } catch (err) {
    logger.error("Use item error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message === "ITEM_NOT_FOUND") {
      return NextResponse.json({ error: "物品不存在" }, { status: 404 });
    }
    if (message === "ITEM_STATUS_INVALID") {
      return NextResponse.json({ error: "物品状态异常" }, { status: 400 });
    }
    return NextResponse.json({ error: "使用失败" }, { status: 500 });
  }
});
