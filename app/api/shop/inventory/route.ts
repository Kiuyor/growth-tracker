import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shop/inventory
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.userItem.findMany({
    where: { userId: session.userId },
    include: { shopItem: true, useLogs: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}
