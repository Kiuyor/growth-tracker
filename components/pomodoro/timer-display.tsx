"use client";

import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
  mode: "COUNTDOWN" | "STOPWATCH";
}

export function TimerDisplay({
  remainingSeconds,
  totalSeconds,
  mode,
}: TimerDisplayProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress =
    mode === "COUNTDOWN" && totalSeconds > 0
      ? remainingSeconds / totalSeconds
      : Math.min(remainingSeconds / (25 * 60), 1);

  const radius = 120;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const progressColor =
    progress < 0.15 ? "text-destructive" : progress < 0.4 ? "text-yellow-500" : "text-primary";

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90 transform"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          className="text-muted"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-linear", progressColor)}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold tabular-nums tracking-tight">
          {display}
        </span>
        <span className="mt-1 text-sm text-muted-foreground">
          {mode === "COUNTDOWN" ? "倒计时" : "正计时"}
        </span>
      </div>
    </div>
  );
}
