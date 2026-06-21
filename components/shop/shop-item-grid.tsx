"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShopItem } from "@/types";
import { ShopItemCard } from "./shop-item-card";
import { PurchaseModal } from "./purchase-modal";
import { Button } from "@/components/ui/button";

interface ShopItemGridProps {
  items: ShopItem[];
  balance: number;
}

const tabs = [
  { key: "ALL", label: "全部" },
  { key: "REWARD", label: "奖励" },
  { key: "DECORATION", label: "装扮" },
  { key: "CONSUMABLE", label: "消耗品" },
];

export function ShopItemGrid({ items, balance }: ShopItemGridProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const filteredItems =
    activeTab === "ALL"
      ? items
      : items.filter((item) => item.type === activeTab);

  async function handlePurchase(item: ShopItem) {
    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopItemId: item.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "兑换失败");
        return;
      }

      toast.success(`兑换成功！当前余额：${data.balance} 积分`);
      setSelectedItem(null);
      router.refresh();
    } catch {
      toast.error("网络错误，请稍后重试");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          该分类下暂无商品
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              balance={balance}
              onPurchase={setSelectedItem}
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <PurchaseModal
          item={selectedItem}
          balance={balance}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={() => handlePurchase(selectedItem)}
        />
      )}
    </div>
  );
}
