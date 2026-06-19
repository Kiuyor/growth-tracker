"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShopItem } from "@/types";
import { formatLimitText, parseLimitConfig } from "@/lib/shop-rules";

interface PurchaseModalProps {
  item: ShopItem;
  balance: number;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PurchaseModal({
  item,
  balance,
  open,
  onClose,
  onConfirm,
}: PurchaseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canAfford = balance >= item.cost;

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }

  const limitConfig = parseLimitConfig(item.limitConfig);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>确认兑换</DialogTitle>
          <DialogDescription>
            你确定要兑换「{item.name}」吗？
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">兑换价格</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {item.cost} 积分
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">当前余额</span>
            <span className="font-medium">{balance} 积分</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">兑换后余额</span>
            <span
              className={`font-medium ${
                canAfford ? "" : "text-destructive"
              }`}
            >
              {balance - item.cost} 积分
            </span>
          </div>
          {limitConfig && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">兑换限制</span>
              <span className="font-medium">{formatLimitText(limitConfig)}</span>
            </div>
          )}
          {!canAfford && (
            <p className="text-sm text-destructive">积分不足，先去完成任务吧！</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!canAfford || isSubmitting}>
            {isSubmitting ? "兑换中..." : "确认兑换"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
