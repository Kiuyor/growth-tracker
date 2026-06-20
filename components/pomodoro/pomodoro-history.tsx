"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";
import type { Pomodoro } from "@/types";

interface PomodoroHistoryProps {
  history: Pomodoro[];
}

export function PomodoroHistory({ history }: PomodoroHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">专注记录</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无专注记录，开始一次番茄钟吧！</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">最近专注记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between rounded-lg border p-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                专注 {item.duration} 分钟
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(item.startedAt), "M月d日 HH:mm", { locale: zhCN })}
              </div>
              {item.taskTitle && (
                <div className="text-xs text-muted-foreground">
                  关联任务：{item.taskTitle}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-primary">
                +{item.points ?? 0} 积分
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
