"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
  emptyText?: string;
}

export function ChartCard({
  title,
  children,
  empty,
  emptyText = "数据不足，多使用应用来生成图表吧",
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[260px]">
        {empty ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
