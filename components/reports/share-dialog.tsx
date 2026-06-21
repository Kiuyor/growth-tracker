"use client";

import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareCard } from "./share-card";
import { Download, Loader2 } from "lucide-react";
import type { ReportStats } from "@/types";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReportStats;
}

export function ShareDialog({ open, onOpenChange, data }: ShareDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setDownloading(true);
    try {
      // 等待字体和图标渲染完成
      await document.fonts.ready;

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#6366f1",
      });

      const link = document.createElement("a");
      const period = data.type === "weekly" ? "周报" : "月报";
      link.download = `${period}-${data.current.start}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>生成分享图</DialogTitle>
          <DialogDescription>
            预览效果满意后，点击下方按钮下载 PNG 图片。
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center overflow-x-auto py-4">
          <div ref={cardRef}>
            <ShareCard data={data} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                下载图片
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
