import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InventoryList } from "@/components/shop/inventory-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserItem } from "@/types";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的背包 | 成长追踪",
  description: "查看已兑换的物品，管理你的装备",
};

export default async function InventoryPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const rawItems = await prisma.userItem.findMany({
    where: { userId: session.userId },
    include: { shopItem: true, useLogs: true },
    orderBy: { createdAt: "desc" },
  });

  const items: UserItem[] = rawItems.map((i) => ({
    ...i,
    status: i.status as UserItem["status"],
    usedAt: i.usedAt ? i.usedAt.toISOString() : null,
    createdAt: i.createdAt.toISOString(),
    shopItem: {
      ...i.shopItem,
      type: i.shopItem.type as UserItem["shopItem"]["type"],
      createdAt: i.shopItem.createdAt.toISOString(),
      updatedAt: i.shopItem.updatedAt.toISOString(),
    },
    useLogs: i.useLogs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/shop">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回商店
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">我的库存</h2>
      </div>

      <InventoryList items={items} />
    </div>
  );
}
