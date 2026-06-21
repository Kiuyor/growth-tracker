"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserItem } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UseItemModal } from "./use-item-modal";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ShoppingBag } from "lucide-react";

interface InventoryListProps {
  items: UserItem[];
}

const statusMap = {
  UNUSED: { label: "待使用", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
  USED: { label: "已使用", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  EXPIRED: { label: "已过期", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

export function InventoryList({ items }: InventoryListProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);

  async function handleUse(note: string) {
    if (!selectedItem) return;

    try {
      const res = await fetch(`/api/shop/inventory/${selectedItem.id}/use`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "使用失败");
        return;
      }

      toast.success("使用成功！");
      setSelectedItem(null);
      router.refresh();
    } catch {
      toast.error("网络错误，请稍后重试");
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        还没有兑换过商品，去商店看看吧！
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const status = statusMap[item.status as keyof typeof statusMap] || statusMap.EXPIRED;
          return (
            <Card key={item.id} className={item.status === "USED" ? "opacity-75" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{item.shopItem.name}</CardTitle>
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>兑换时间：{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}</p>
                  {item.usedAt && (
                    <p>使用时间：{format(new Date(item.usedAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}</p>
                  )}
                  {item.useLogs.length > 0 && item.useLogs[0].note && (
                    <p>备注：{item.useLogs[0].note}</p>
                  )}
                </div>
              </CardContent>
              {item.status === "UNUSED" && (
                <CardFooter>
                  <Button className="w-full" onClick={() => setSelectedItem(item)}>
                    使用
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {selectedItem && (
        <UseItemModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleUse}
        />
      )}
    </>
  );
}
