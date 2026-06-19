import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InventoryList } from "@/components/shop/inventory-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InventoryPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const items = await prisma.userItem.findMany({
    where: { userId: session.userId },
    include: { shopItem: true, useLogs: true },
    orderBy: { createdAt: "desc" },
  });

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

      <InventoryList items={items as unknown as import("@/types").UserItem[]} />
    </div>
  );
}
