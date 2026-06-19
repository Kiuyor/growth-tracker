"use client";

import { ShoppingBag, Coffee, Sparkles, Zap, Gift, Crown } from "lucide-react";
import { ShopItem } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { shopItemTypeLabel, formatLimitText, parseLimitConfig } from "@/lib/shop-rules";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof ShoppingBag> = {
  ShoppingBag,
  Coffee,
  Sparkles,
  Zap,
  Gift,
  Crown,
};

interface ShopItemCardProps {
  item: ShopItem;
  balance: number;
  onPurchase: (item: ShopItem) => void;
}

export function ShopItemCard({ item, balance, onPurchase }: ShopItemCardProps) {
  const Icon = item.icon ? iconMap[item.icon] || ShoppingBag : ShoppingBag;
  const typeColor: Record<string, string> = {
    REWARD: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    DECORATION: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    CONSUMABLE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  };

  const limitConfig = parseLimitConfig(item.limitConfig);
  const canAfford = balance >= item.cost;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">{item.name}</CardTitle>
          </div>
          <Badge className={cn("", typeColor[item.type] || typeColor.REWARD)}>
            {shopItemTypeLabel[item.type as keyof typeof shopItemTypeLabel] || item.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
            {item.cost} 积分
          </Badge>
          {limitConfig && (
            <Badge variant="outline">{formatLimitText(limitConfig)}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!canAfford}
          onClick={() => onPurchase(item)}
        >
          {canAfford ? "兑换" : "积分不足"}
        </Button>
      </CardFooter>
    </Card>
  );
}
