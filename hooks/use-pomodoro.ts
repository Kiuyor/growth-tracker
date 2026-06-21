"use client";

import { useCallback, useState } from "react";
import type { Pomodoro, PomodoroStats } from "@/types";
import {
  fetchPomodoroHistory,
  fetchPomodoroStats,
  startPomodoro,
  completePomodoro,
  abortPomodoro,
  type StartPomodoroParams,
  type CompletePomodoroParams,
} from "@/lib/pomodoro-api";

interface UsePomodoroReturn {
  activeId: string | null;
  history: Pomodoro[];
  stats: PomodoroStats | null;
  loading: boolean;
  start: (params: StartPomodoroParams) => Promise<string>;
  complete: (params: CompletePomodoroParams) => Promise<{
    points: number;
    taskCompleted: boolean;
  }>;
  abort: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePomodoro(): UsePomodoroReturn {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<Pomodoro[]>([]);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const [h, s] = await Promise.all([
      fetchPomodoroHistory(),
      fetchPomodoroStats(),
    ]);
    setHistory(h);
    setStats(s);
  }, []);

  const start = useCallback(async (params: StartPomodoroParams) => {
    setLoading(true);
    try {
      const id = await startPomodoro(params);
      setActiveId(id);
      return id;
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(
    async (params: CompletePomodoroParams) => {
      setLoading(true);
      try {
        const result = await completePomodoro(params);
        setActiveId(null);
        const [h, s] = await Promise.all([
          fetchPomodoroHistory(),
          fetchPomodoroStats(),
        ]);
        setHistory(h);
        setStats(s);
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const abort = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await abortPomodoro(id);
      setActiveId(null);
      const [h, s] = await Promise.all([
        fetchPomodoroHistory(),
        fetchPomodoroStats(),
      ]);
      setHistory(h);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

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
