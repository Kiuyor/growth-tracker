import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Timer,
  CheckCircle2,
  ListTodo,
  Flame,
  Smile,
  Trophy,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { generateShareQuote } from "@/lib/reports";
import type { ReportStats } from "@/types";

interface ShareCardProps {
  data: ReportStats;
}

function formatHighlightDate(dateStr: string) {
  return format(parseISO(dateStr), "M月d日", { locale: zhCN });
}

export function ShareCard({ data }: ShareCardProps) {
  const title = data.type === "weekly" ? "我的学习周报" : "我的学习月报";
  const quote = generateShareQuote(data);

  const stats = [
    { label: "专注", value: `${data.summary.pomodoroMinutes}m`, icon: Timer },
    { label: "任务", value: `${data.summary.tasksCompleted}`, icon: CheckCircle2 },
    { label: "打卡", value: `${data.summary.checkInDays}天`, icon: Flame },
    { label: "次数", value: `${data.summary.pomodoroCount}`, icon: ListTodo },
    {
      label: "心情",
      value: data.summary.moodAverage !== null ? `${data.summary.moodAverage}` : "-",
      icon: Smile,
    },
    { label: "积分", value: `${data.summary.pointsEarned}`, icon: Trophy },
  ];

  const highlights = [
    data.highlights.mostFocusDay
      ? { emoji: "🏆", label: "最专注", text: `${formatHighlightDate(data.highlights.mostFocusDay.date)} · ${data.highlights.mostFocusDay.minutes}分钟` }
      : null,
    data.highlights.mostTasksDay
      ? { emoji: "✅", label: "最多任务", text: `${formatHighlightDate(data.highlights.mostTasksDay.date)} · ${data.highlights.mostTasksDay.count}个` }
      : null,
    data.highlights.bestMoodDay
      ? { emoji: "😊", label: "最佳心情", text: `${formatHighlightDate(data.highlights.bestMoodDay.date)} · ${data.highlights.bestMoodDay.score}分` }
      : null,
  ].filter(Boolean);

  return (
    <div className="w-[360px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold leading-tight">{title}</h3>
          <p className="text-xs text-white/80">{data.current.label}</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl bg-white/15 p-4 backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-white/80">
          <TrendingUp className="h-3 w-3" />
          本周寄语
        </div>
        <p className="text-sm font-medium leading-relaxed">"{quote}"</p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-white/15 p-3 text-center backdrop-blur-sm"
            >
              <Icon className="mx-auto mb-1 h-4 w-4 text-white/90" />
              <p className="text-lg font-bold leading-none">{stat.value}</p>
              <p className="mt-1 text-[10px] text-white/75">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {highlights.length > 0 && (
        <div className="mb-5 space-y-2">
          {highlights.map((h) => (
            <div
              key={h!.label}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm backdrop-blur-sm"
            >
              <span className="text-base">{h!.emoji}</span>
              <span className="font-medium">{h!.label}</span>
              <span className="ml-auto text-xs text-white/80">{h!.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/20 pt-4">
        <div className="text-xs text-white/70">
          <p className="font-semibold text-white">成长追踪</p>
          <p>记录每一步进步</p>
        </div>
        <div className="text-right text-xs text-white/70">
          growth-tracker.vercel.app
        </div>
      </div>
    </div>
  );
}
