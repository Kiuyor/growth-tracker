import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ArrowRight } from "lucide-react";

export async function PointsMallSection() {
  const session = await auth();
  if (!session.userId) return null;

  const [profile, items] = await Promise.all([
    prisma.userProfile.findUnique({ where: { clerkId: session.userId } }),
    prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            积分商城
          </CardTitle>
          <Link href="/shop">
            <Button variant="ghost" size="sm">
              去商店
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          当前余额：
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {profile?.totalPoints || 0} 积分
          </span>
        </div>
        {items.length === 0 ? (
          <p className="text-muted-foreground">商店正在筹备中，敬请期待...</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href="/shop">
                <div className="rounded-lg border p-3 transition-colors hover:bg-muted">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.description || "去商店看看"}</p>
                  <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                    {item.cost} 积分
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
