"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyTrendChart } from "@/components/charts/weekly-trend-chart";
import { StreakChart } from "@/components/charts/streak-chart";
import { ShareDialog } from "@/components/reports/share-dialog";
import { ReportHeader } from "./components/report-header";
import { SummaryText } from "./components/summary-text";
import { StatGrid } from "./components/stat-grid";
import { HighlightCards } from "./components/highlight-cards";
import type { ReportStats } from "@/types";

interface ReportClientProps {
  type: "weekly" | "monthly";
  initialData: ReportStats;
}

export function ReportClient({ type, initialData }: ReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ReportStats>(initialData);
  const [offset, setOffset] = useState(parseInt(searchParams.get("offset") || "0", 10) || 0);
  const [loading, setLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const fetchData = useCallback(
    async (newOffset: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?type=${type}&offset=${newOffset}`);
        if (res.ok) {
          const newData = (await res.json()) as ReportStats;
          setData(newData);
          setOffset(newOffset);
          router.replace(`/reports/${type}?offset=${newOffset}`, { scroll: false });
        }
      } finally {
        setLoading(false);
      }
    },
    [router, type]
  );

  const handlePrev = () => fetchData(offset - 1);
  const handleNext = () => fetchData(offset + 1);
  const handleCurrent = () => fetchData(0);

  const streakData = data.daily.map((d) => ({
    date: d.date,
    streak: d.streak || 0,
  }));

  return (
    <div className={cn("space-y-6", loading && "opacity-70")}>
      <ReportHeader
        type={type}
        label={data.current.label}
        offset={offset}
        onPrev={handlePrev}
        onNext={handleNext}
        onCurrent={handleCurrent}
        onShare={() => setShareOpen(true)}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{type === "weekly" ? "本周" : "本月"}总结</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryText data={data} />
        </CardContent>
      </Card>

      <StatGrid stats={data} />
      <HighlightCards highlights={data.highlights} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-h-[300px]">
          <WeeklyTrendChart data={data.daily} />
        </div>
        <div className="min-h-[300px]">
          <StreakChart data={streakData} />
        </div>
      </div>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} data={data} />
    </div>
  );
}
