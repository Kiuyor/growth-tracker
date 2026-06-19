import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  const profile = await prisma.userProfile.upsert({
    where: { clerkId: session.userId },
    update: {},
    create: { clerkId: session.userId },
  });

  return (
    <div className="min-h-screen bg-background">
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar points={profile.totalPoints} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
