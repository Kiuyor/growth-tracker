import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/checkin/history?year=&month=
export async function GET(request: Request) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") || new Date().getFullYear());
  const month = Number(searchParams.get("month") || new Date().getMonth() + 1);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month - 1, 31, 23, 59, 59, 999);

  const records = await prisma.dailyCheck.findMany({
    where: {
      userId: session.userId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(records);
}
