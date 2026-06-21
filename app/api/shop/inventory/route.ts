import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

// GET /api/shop/inventory
export const GET = withAuth(async (userId) => {
  const items = await prisma.userItem.findMany({
    where: { userId },
    include: { shopItem: true, useLogs: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
});
