import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.upsert({
    where: { clerkId: session.userId },
    update: {},
    create: { clerkId: session.userId },
  });

  return NextResponse.json(profile);
}
