"use client";

import { Button } from "@/components/ui/button";
import type { TimerState } from "@/types";
import { Play, Pause, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onAbort: () => void;
  disabled?: boolean;
}

export function TimerControls({
  state,
  onStart,
  onPause,
  onResume,
  onComplete,
  onAbort,
  disabled,
}: TimerControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {state === "idle" && (
        <Button size="lg" onClick={onStart} disabled={disabled}>
          <Play className="h-5 w-5" />
          开始专注
        </Button>
      )}

      {state === "running" && (
        <>
          <Button size="lg" variant="outline" onClick={onPause} disabled={disabled}>
            <Pause className="h-5 w-5" />
            暂停
          </Button>
          <Button size="lg" onClick={onComplete} disabled={disabled}>
            <CheckCircle2 className="h-5 w-5" />
            完成
          </Button>
        </>
      )}

      {state === "paused" && (
        <>
          <Button size="lg" onClick={onResume} disabled={disabled}>
            <Play className="h-5 w-5" />
            继续
          </Button>
          <Button size="lg" variant="outline" onClick={onComplete} disabled={disabled}>
            <CheckCircle2 className="h-5 w-5" />
            完成
          </Button>
        </>
      )}

      {(state === "running" || state === "paused") && (
        <Button
          size="lg"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={onAbort}
          disabled={disabled}
        >
          <XCircle className="h-5 w-5" />
          放弃
        </Button>
      )}

      {state === "idle" && (
        <Button size="lg" variant="ghost" onClick={onAbort} disabled={disabled}>
          <RotateCcw className="h-5 w-5" />
          重置
        </Button>
      )}
    </div>
  );
}
