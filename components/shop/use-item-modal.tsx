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
import { Textarea } from "@/components/ui/textarea";
import { UserItem } from "@/types";

interface UseItemModalProps {
  item: UserItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export function UseItemModal({
  item,
  open,
  onClose,
  onConfirm,
}: UseItemModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm(note);
      setNote("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>使用「{item?.shopItem.name}」</DialogTitle>
          <DialogDescription>
            使用后该物品将标记为已使用。你可以填写备注记录用途。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <label htmlFor="use-note" className="text-sm font-medium">
            备注（可选）
          </label>
          <Textarea
            id="use-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：兑换了一杯奶茶"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "使用中..." : "确认使用"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
