"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeeklyTrendChart } from "@/components/charts/weekly-trend-chart";
import { StreakChart } from "@/components/charts/streak-chart";
import { cn } from "@/lib/utils";
import type { ReportStats } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Timer,
  CheckCircle2,
  ListTodo,
  Flame,
  Smile,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface ReportClientProps {
  type: "weekly" | "monthly";
  initialData: ReportStats;
}

const labels = {
  weekly: { singular: "周", this: "本周", prev: "上周", next: "下周" },
  monthly: { singular: "月", this: "本月", prev: "上月", next: "下月" },
};

function formatDate(dateStr: string) {
  return format(parseISO(dateStr), "M月d日", { locale: zhCN });
}

function ComparisonBadge({ value, suffix = "%" }: { value: number | null; suffix?: string }) {
  if (value === null || value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        持平
      </span>
    );
  }

  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", colorClass)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

function SummaryText({ data }: { data: ReportStats }) {
  const text = useMemo(() => {
    const { summary, comparison, streak, type } = data;
    const period = labels[type].singular;
    const focusText = `${period}共专注了 ${summary.pomodoroMinutes} 分钟`;
    const taskText = `完成了 ${summary.tasksCompleted} 个任务`;
    const taskCompare =
      comparison.tasksCompleted > 0
        ? `比上${period}增长了 ${comparison.tasksCompleted}%`
        : comparison.tasksCompleted < 0
        ? `比上${period}下降了 ${Math.abs(comparison.tasksCompleted)}%`
        : `与上${period}持平`;
    const streakText =
      streak.change > 0
        ? `连续打卡天数从 ${streak.start} 天提升到了 ${streak.end} 天`
        : streak.change < 0
        ? `连续打卡天数从 ${streak.start} 天下降到了 ${streak.end} 天`
        : `连续打卡天数保持在 ${streak.end} 天`;

    let moodText = "";
    if (summary.moodAverage !== null) {
      moodText = `，心情平均分 ${summary.moodAverage} 分`;
    }

    return `${focusText}，${taskText}，${taskCompare}${moodText}。${streakText}。`;
  }, [data]);

  return <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>;
}

export function ReportClient({ type, initialData }: ReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ReportStats>(initialData);
  const [offset, setOffset] = useState(parseInt(searchParams.get("offset") || "0", 10) || 0);
  const [loading, setLoading] = useState(false);

  const labelSet = labels[type];

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

  const statCards = [
    {
      title: "专注时长",
      value: `${data.summary.pomodoroMinutes}m`,
      compare: data.comparison.pomodoroMinutes,
      icon: Timer,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "专注次数",
      value: `${data.summary.pomodoroCount}`,
      compare: data.comparison.pomodoroCount,
      icon: ListTodo,
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "完成任务",
      value: `${data.summary.tasksCompleted}`,
      compare: data.comparison.tasksCompleted,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "打卡天数",
      value: `${data.summary.checkInDays}`,
      compare: data.comparison.checkInDays,
      icon: Flame,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "心情均分",
      value: data.summary.moodAverage !== null ? `${data.summary.moodAverage}` : "-",
      compare: data.comparison.moodAverage,
      icon: Smile,
      color: "text-pink-600 dark:text-pink-400",
      suffix: "分",
    },
    {
      title: "获得积分",
      value: `${data.summary.pointsEarned}`,
      compare: data.comparison.pointsEarned,
      icon: Trophy,
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  const streakData = data.daily.map((d) => ({
    date: d.date,
    streak: d.streak || 0,
  }));

  return (
    <div className={cn("space-y-6", loading && "opacity-70")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{type === "weekly" ? "周报" : "月报"}</h2>
          <p className="text-sm text-muted-foreground">
            {data.current.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {labelSet.prev}
          </Button>
          <Button
            variant={offset === 0 ? "default" : "outline"}
            size="sm"
            onClick={handleCurrent}
          >
            {labelSet.this}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            {labelSet.next}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{labelSet.this}总结</CardTitle>
        </CardHeader>
        <CardContent>
          <SummaryText data={data} />
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={cn("flex items-center gap-2 text-xl font-bold", stat.color)}>
                  <Icon className="h-4 w-4" />
                  {stat.value}
                  {stat.suffix && <span className="text-sm font-normal">{stat.suffix}</span>}
                </div>
                <div className="mt-1">
                  <ComparisonBadge value={stat.compare} suffix={stat.suffix ? "" : "%"} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">最专注的一天</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center">
            {data.highlights.mostFocusDay ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatDate(data.highlights.mostFocusDay.date)}
                </p>
                <Badge variant="secondary">
                  {data.highlights.mostFocusDay.minutes} 分钟
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">本周期暂无专注记录</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">完成任务最多的一天</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center">
            {data.highlights.mostTasksDay ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatDate(data.highlights.mostTasksDay.date)}
                </p>
                <Badge variant="secondary">
                  {data.highlights.mostTasksDay.count} 个任务
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">本周期暂无完成任务</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">心情最好的一天</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center">
            {data.highlights.bestMoodDay ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatDate(data.highlights.bestMoodDay.date)}
                </p>
                <Badge variant="secondary">
                  {data.highlights.bestMoodDay.score} 分
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">本周期暂无心情记录</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-h-[300px]">
          <WeeklyTrendChart data={data.daily} />
        </div>
        <div className="min-h-[300px]">
          <StreakChart data={streakData} />
        </div>
      </div>
    </div>
  );
}
