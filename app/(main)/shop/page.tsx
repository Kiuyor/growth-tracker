import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShopItemGrid } from "@/components/shop/shop-item-grid";
import { Button } from "@/components/ui/button";
import { Backpack } from "lucide-react";
import Link from "next/link";
import type { ShopItem } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "积分商城 | 成长追踪",
  description: "用积分兑换奖励商品，让成长更有动力",
};

export default async function ShopPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const [profile, rawItems] = await Promise.all([
    prisma.userProfile.findUnique({ where: { clerkId: session.userId } }),
    prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const items: ShopItem[] = rawItems.map((i) => ({
    ...i,
    type: i.type as ShopItem["type"],
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }));

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
        items={items}
        balance={profile?.totalPoints || 0}
      />
    </div>
  );
}
