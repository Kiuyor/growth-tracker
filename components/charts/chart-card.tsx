"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
  emptyText?: string;
  className?: string;
}

export function ChartCard({
  title,
  children,
  empty,
  emptyText = "数据不足，多使用应用来生成图表吧",
  className,
}: ChartCardProps) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        {empty ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
