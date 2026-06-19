import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/shop/inventory/[id]/use
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { note } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const userItem = await tx.userItem.findFirst({
        where: { id, userId: session.userId },
        include: { shopItem: true },
      });

      if (!userItem) {
        return { error: "物品不存在", status: 404 };
      }

      if (userItem.status !== "UNUSED") {
        return { error: "物品状态异常", status: 400 };
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

      return { userItem: updated, useLog, status: 200 };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Use item error:", err);
    return NextResponse.json({ error: "使用失败" }, { status: 500 });
  }
}
