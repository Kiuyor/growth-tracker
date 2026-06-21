"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerMode, TimerState } from "@/types";

interface UseTimerOptions {
  mode: TimerMode;
  initialSeconds: number;
}

interface UseTimerReturn {
  state: TimerState;
  remainingSeconds: number;
  totalSeconds: number;
  elapsedMinutes: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newSeconds?: number) => void;
}

export function useTimer({
  mode,
  initialSeconds,
}: UseTimerOptions): UseTimerReturn {
  const [state, setState] = useState<TimerState>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const targetEndRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    if (mode === "COUNTDOWN") {
      const diff = Math.ceil((targetEndRef.current - now) / 1000);
      const next = Math.max(0, diff);
      setRemainingSeconds(next);
      if (next <= 0) {
        clearTimer();
        setState("idle");
      }
    } else {
      const diff = Math.floor((now - targetEndRef.current) / 1000);
      setRemainingSeconds(diff);
    }
    lastTickRef.current = now;
  }, [clearTimer, mode]);

  const start = useCallback(() => {
    clearTimer();
    setState("running");
    const now = Date.now();
    lastTickRef.current = now;
    if (mode === "COUNTDOWN") {
      targetEndRef.current = now + remainingSeconds * 1000;
    } else {
      targetEndRef.current = now - remainingSeconds * 1000;
      setTotalSeconds(remainingSeconds);
    }

    intervalRef.current = setInterval(tick, 1000);
  }, [clearTimer, mode, remainingSeconds, tick]);

  const pause = useCallback(() => {
    clearTimer();
    setState("paused");
  }, [clearTimer]);

  const resume = useCallback(() => {
    clearTimer();
    setState("running");
    const now = Date.now();
    if (mode === "COUNTDOWN") {
      targetEndRef.current = now + remainingSeconds * 1000;
    } else {
      targetEndRef.current = now - remainingSeconds * 1000;
    }

    intervalRef.current = setInterval(tick, 1000);
  }, [clearTimer, mode, remainingSeconds, tick]);

  const reset = useCallback(
    (newSeconds?: number) => {
      clearTimer();
      const seconds = newSeconds !== undefined ? newSeconds : initialSeconds;
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
      setState("idle");
    },
    [clearTimer, initialSeconds]
  );

  // 浏览器后台切换校準
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || state !== "running") return;
      tick();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state, tick]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const elapsedSeconds =
    mode === "COUNTDOWN"
      ? totalSeconds - remainingSeconds
      : remainingSeconds;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  return {
    state,
    remainingSeconds,
    totalSeconds,
    elapsedMinutes,
    start,
    pause,
    resume,
    reset,
  };
}
