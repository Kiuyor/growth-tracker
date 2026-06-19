import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopItemGrid } from "@/components/shop/shop-item-grid";
import { Button } from "@/components/ui/button";
import { Backpack } from "lucide-react";
import Link from "next/link";

export default async function ShopPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const [profile, items] = await Promise.all([
    prisma.userProfile.findUnique({ where: { clerkId: session.userId } }),
    prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">积分商店</h2>
          <p className="text-sm text-muted-foreground">
            用努力换来的积分，兑换属于你的奖励吧
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            余额 {profile?.totalPoints || 0} 积分
          </div>
          <Link href="/shop/inventory">
            <Button variant="outline" size="sm">
              <Backpack className="mr-2 h-4 w-4" />
              我的库存
            </Button>
          </Link>
        </div>
      </div>

      <ShopItemGrid
        items={items as unknown as import("@/types").ShopItem[]}
        balance={profile?.totalPoints || 0}
      />
    </div>
  );
}
