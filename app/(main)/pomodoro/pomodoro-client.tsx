"use client";

import { useMemo, useState } from "react";
import { useTimer } from "@/hooks/use-timer";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { TimerDisplay } from "@/components/pomodoro/timer-display";
import { TimerControls } from "@/components/pomodoro/timer-controls";
import { DurationPicker } from "@/components/pomodoro/duration-picker";
import { TaskSelector } from "@/components/pomodoro/task-selector";
import { ModeToggle } from "@/components/pomodoro/mode-toggle";
import { PomodoroHistory } from "@/components/pomodoro/pomodoro-history";
import { PomodoroStats as PomodoroStatsCards } from "@/components/pomodoro/pomodoro-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { calcPomodoroPoints, getPomodoroTierLabel } from "@/lib/pomodoro-rules";
import type { Pomodoro, PomodoroStats, Task, TimerMode } from "@/types";

interface PomodoroClientProps {
  initialHistory: Pomodoro[];
  initialStats: PomodoroStats;
  initialTasks: Task[];
}

export function PomodoroClient({
  initialHistory,
  initialStats,
  initialTasks,
}: PomodoroClientProps) {
  const [mode, setMode] = useState<TimerMode>("COUNTDOWN");
  const [duration, setDuration] = useState(25);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [completeTask, setCompleteTask] = useState(false);
  const [started, setStarted] = useState(false);

  const { activeId, history, stats, loading, start, complete, abort, refresh } =
    usePomodoro();

  const initialSeconds = useMemo(
    () => (mode === "COUNTDOWN" ? duration * 60 : 0),
    [mode, duration]
  );

  const timer = useTimer({ mode, initialSeconds });

  const handleStart = async () => {
    const id = await start({ duration, taskId: taskId || undefined, mode });
    if (id) {
      setStarted(true);
      timer.start();
    }
  };

  const handlePause = () => {
    timer.pause();
  };

  const handleResume = () => {
    timer.resume();
  };

  const handleComplete = async () => {
    if (!activeId) return;
    const actualMinutes = timer.elapsedMinutes;
    const result = await complete({
      id: activeId,
      actualMinutes,
      completeTask,
    });
    const points = result.points + (completeTask && taskId ? 0 : 0);
    const totalPoints =
      points +
      (result.taskCompleted
        ? initialTasks.find((t) => t.id === taskId)?.points || 0
        : 0);
    window.alert(
      `专注结束！实际专注 ${actualMinutes} 分钟，${
        totalPoints > 0 ? `获得 ${totalPoints} 积分` : "未达到最低积分时长"
      }${result.taskCompleted ? "，关联任务已标记为完成" : ""}`
    );
    setStarted(false);
    timer.reset(mode === "COUNTDOWN" ? duration * 60 : 0);
    setCompleteTask(false);
    await refresh();
  };

  const handleAbort = async () => {
    if (!activeId) {
      timer.reset(mode === "COUNTDOWN" ? duration * 60 : 0);
      setStarted(false);
      return;
    }
    if (!window.confirm("确定要放弃这次专注吗？放弃后不会获得积分。")) return;
    await abort(activeId);
    setStarted(false);
    timer.reset(mode === "COUNTDOWN" ? duration * 60 : 0);
    await refresh();
  };

  const expectedPoints = calcPomodoroPoints(
    mode === "COUNTDOWN" ? duration : Math.max(0, timer.elapsedMinutes)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">番茄钟</h2>
      </div>

      <PomodoroStatsCards stats={stats || initialStats} />

      <Card className="mx-auto max-w-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-base">开始专注</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ModeToggle
            value={mode}
            onChange={(m) => {
              setMode(m);
              timer.reset(m === "COUNTDOWN" ? duration * 60 : 0);
            }}
            disabled={started || loading}
          />

          <TimerDisplay
            remainingSeconds={timer.remainingSeconds}
            totalSeconds={timer.totalSeconds}
            mode={mode}
          />

          {!started && (
            <>
              <DurationPicker
                value={duration}
                onChange={(d) => {
                  setDuration(d);
                  if (mode === "COUNTDOWN") {
                    timer.reset(d * 60);
                  }
                }}
                disabled={loading}
              />

              <TaskSelector
                tasks={initialTasks}
                value={taskId}
                onChange={setTaskId}
                disabled={loading}
              />

              {taskId && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="complete-task"
                    checked={completeTask}
                    onCheckedChange={(checked) => setCompleteTask(checked === true)}
                    disabled={loading}
                  />
                  <label
                    htmlFor="complete-task"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    完成后一并标记任务为完成
                  </label>
                </div>
              )}
            </>
          )}

          <div className="text-center text-sm text-muted-foreground">
            {started
              ? `已专注 ${timer.elapsedMinutes} 分钟`
              : `预计可获得 ${expectedPoints} 积分（${getPomodoroTierLabel(
                  mode === "COUNTDOWN" ? duration : 0
                )}）`}
          </div>

          <TimerControls
            state={timer.state}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={handleComplete}
            onAbort={handleAbort}
            disabled={loading}
          />
        </CardContent>
      </Card>

      <PomodoroHistory history={history.length > 0 ? history : initialHistory} />
    </div>
  );
}
