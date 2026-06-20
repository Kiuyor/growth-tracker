"use client";

import { useCallback, useEffect, useState } from "react";
import type { Pomodoro, PomodoroStats, TimerMode } from "@/types";

interface StartParams {
  duration: number;
  taskId?: string;
  mode: TimerMode;
}

interface UsePomodoroReturn {
  activeId: string | null;
  history: Pomodoro[];
  stats: PomodoroStats | null;
  loading: boolean;
  start: (params: StartParams) => Promise<string>;
  complete: (params: {
    id: string;
    actualMinutes: number;
    completeTask?: boolean;
  }) => Promise<{ points: number; taskCompleted: boolean }>;
  abort: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePomodoro(): UsePomodoroReturn {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<Pomodoro[]>([]);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    const res = await fetch("/api/pomodoro?limit=20");
    if (res.ok) {
      const data = (await res.json()) as Pomodoro[];
      setHistory(data);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/pomodoro/stats");
    if (res.ok) {
      const data = (await res.json()) as PomodoroStats;
      setStats(data);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchHistory(), fetchStats()]);
  }, [fetchHistory, fetchStats]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const start = useCallback(async (params: StartParams) => {
    setLoading(true);
    try {
      const res = await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = (await res.json()) as Pomodoro & { mode: TimerMode };
      if (!res.ok) {
        throw new Error((data as unknown as { error?: string }).error || "Failed to start");
      }
      setActiveId(data.id);
      return data.id;
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(
    async ({
      id,
      actualMinutes,
      completeTask,
    }: {
      id: string;
      actualMinutes: number;
      completeTask?: boolean;
    }) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pomodoro/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "COMPLETE", actualMinutes, completeTask }),
        });
        const data = (await res.json()) as {
          pomodoro: Pomodoro;
          points: { log: { amount: number } } | null;
          taskCompleted: boolean;
        };
        if (!res.ok) {
          throw new Error(
            (data as unknown as { error?: string }).error || "Failed to complete"
          );
        }
        setActiveId(null);
        setHistory((prev) => [data.pomodoro, ...prev.filter((p) => p.id !== data.pomodoro.id)]);
        await fetchStats();
        return {
          points: data.points?.log?.amount || 0,
          taskCompleted: data.taskCompleted,
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchStats]
  );

  const abort = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pomodoro/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ABORT", actualMinutes: 0 }),
      });
      const data = (await res.json()) as { pomodoro: Pomodoro };
      if (!res.ok) {
        throw new Error(
          (data as unknown as { error?: string }).error || "Failed to abort"
        );
      }
      setActiveId(null);
      setHistory((prev) => [data.pomodoro, ...prev.filter((p) => p.id !== data.pomodoro.id)]);
      await fetchStats();
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  return {
    activeId,
    history,
    stats,
    loading,
    start,
    complete,
    abort,
    refresh,
  };
}
