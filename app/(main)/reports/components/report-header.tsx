"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";

interface ReportHeaderProps {
  type: "weekly" | "monthly";
  label: string;
  offset: number;
  onPrev: () => void;
  onNext: () => void;
  onCurrent: () => void;
  onShare: () => void;
}

const labels = {
  weekly: { title: "周报", this: "本周", prev: "上周", next: "下周" },
  monthly: { title: "月报", this: "本月", prev: "上月", next: "下月" },
};

export function ReportHeader({
  type,
  label,
  offset,
  onPrev,
  onNext,
  onCurrent,
  onShare,
}: ReportHeaderProps) {
  const labelSet = labels[type];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold">{labelSet.title}</h2>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="mr-1 h-4 w-4" />
          生成分享图
        </Button>
        <Button variant="outline" size="sm" onClick={onPrev}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          {labelSet.prev}
        </Button>
        <Button
          variant={offset === 0 ? "default" : "outline"}
          size="sm"
          onClick={onCurrent}
        >
          {labelSet.this}
        </Button>
        <Button variant="outline" size="sm" onClick={onNext}>
          {labelSet.next}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
