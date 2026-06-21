import type { Pomodoro, PomodoroStats, TimerMode } from "@/types";
import { fetchApi } from "@/lib/fetch-api";

/**
 * 番茄钟相关的 API 调用函数。
 * 从 usePomodoro hook 中分离，便于测试和复用。
 */

export interface StartPomodoroParams {
  duration: number;
  taskId?: string;
  mode: TimerMode;
}

export interface CompletePomodoroParams {
  id: string;
  actualMinutes: number;
  completeTask?: boolean;
}

export interface CompletePomodoroResult {
  points: number;
  taskCompleted: boolean;
}

export async function fetchPomodoroHistory(): Promise<Pomodoro[]> {
  const result = await fetchApi<Pomodoro[]>("/api/pomodoro?limit=20");
  if (!result.ok || !result.data) throw new Error(result.error);
  return result.data;
}

export async function fetchPomodoroStats(): Promise<PomodoroStats> {
  const result = await fetchApi<PomodoroStats>("/api/pomodoro/stats");
  if (!result.ok || !result.data) throw new Error(result.error);
  return result.data;
}

export async function startPomodoro(
  params: StartPomodoroParams
): Promise<string> {
  const result = await fetchApi<Pomodoro & { mode: TimerMode }>(
    "/api/pomodoro",
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
  if (!result.ok || !result.data) throw new Error(result.error);
  return result.data.id;
}

export async function completePomodoro(
  params: CompletePomodoroParams
): Promise<CompletePomodoroResult> {
  const result = await fetchApi<{
    pomodoro: Pomodoro;
    points: { log: { amount: number } } | null;
    taskCompleted: boolean;
  }>(`/api/pomodoro/${params.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      action: "COMPLETE",
      actualMinutes: params.actualMinutes,
      completeTask: params.completeTask,
    }),
  });
  if (!result.ok || !result.data) throw new Error(result.error);
  return {
    points: result.data.points?.log?.amount || 0,
    taskCompleted: result.data.taskCompleted,
  };
}

export async function abortPomodoro(id: string): Promise<Pomodoro> {
  const result = await fetchApi<{ pomodoro: Pomodoro }>(
    `/api/pomodoro/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action: "ABORT", actualMinutes: 0 }),
    }
  );
  if (!result.ok || !result.data) throw new Error(result.error);
  return result.data.pomodoro;
}
