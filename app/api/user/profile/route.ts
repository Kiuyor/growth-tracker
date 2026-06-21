import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (userId) => {
  const profile = await prisma.userProfile.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId },
  });

  return NextResponse.json(profile);
});
