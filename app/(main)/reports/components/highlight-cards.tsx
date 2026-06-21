"use client";

import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReportHighlights } from "@/types";

interface HighlightCardsProps {
  highlights: ReportHighlights;
}

function formatDate(dateStr: string) {
  return format(parseISO(dateStr), "M月d日", { locale: zhCN });
}

export function HighlightCards({ highlights }: HighlightCardsProps) {
  const items = [
    {
      title: "最专注的一天",
      data: highlights.mostFocusDay,
      label: (d: { minutes: number }) => `${d.minutes} 分钟`,
    },
    {
      title: "完成任务最多的一天",
      data: highlights.mostTasksDay,
      label: (d: { count: number }) => `${d.count} 个任务`,
    },
    {
      title: "心情最好的一天",
      data: highlights.bestMoodDay,
      label: (d: { score: number }) => `${d.score} 分`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title} className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center">
            {item.data ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">{formatDate(item.data.date)}</p>
                <Badge variant="secondary">{item.label(item.data as never)}</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">本周期暂无记录</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
