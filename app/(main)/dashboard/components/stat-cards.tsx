import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Flame,
  ListTodo,
  Trophy,
  Timer,
  Smile,
} from "lucide-react";
import Link from "next/link";

interface StatCardsProps {
  totalPoints: number;
  streak: number;
  todayCheck: boolean;
  totalTasks: number;
  completedTasks: number;
  todayPomodoroCount: number;
  todayPomodoroMinutes: number;
  todayMood: { moodScore: number } | null;
}

export function StatCards({
  totalPoints,
  streak,
  todayCheck,
  totalTasks,
  completedTasks,
  todayPomodoroCount,
  todayPomodoroMinutes,
  todayMood,
}: StatCardsProps) {
  return (
    <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="h-[72px]">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">总积分</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-2 text-lg font-bold text-amber-600 dark:text-amber-400">
            <Trophy className="h-4 w-4" />
            {totalPoints}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[72px]">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">连续打卡</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-3 pt-0">
          <div className="flex items-center gap-2 text-lg font-bold text-orange-600 dark:text-orange-400">
            <Flame className="h-4 w-4" />
            {streak} 天
          </div>
          <Link href="/checkin">
            <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs">
              {todayCheck ? "查看" : "打卡"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="h-[72px]">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">总任务</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-2 text-lg font-bold">
            <ListTodo className="h-4 w-4" />
            {totalTasks}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[72px]">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">已完成</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-2 text-lg font-bold text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            {completedTasks}
          </div>
        </CardContent>
      </Card>

      <Card className="h-[72px]">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">今日专注</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-3 pt-0">
          <div className="flex items-center gap-2 text-lg font-bold text-blue-600 dark:text-blue-400">
            <Timer className="h-4 w-4" />
            {todayPomodoroCount} / {todayPomodoroMinutes}m
          </div>
          <Link href="/pomodoro">
            <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs">专注</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="h-[72px]">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs font-medium text-muted-foreground">今日心情</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-3 pt-0">
          <div className="flex items-center gap-2 text-lg font-bold text-pink-600 dark:text-pink-400">
            <Smile className="h-4 w-4" />
            {todayMood ? `${todayMood.moodScore}/5` : "未记录"}
          </div>
          <Link href="/mood">
            <Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs">
              {todayMood ? "查看" : "记录"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
