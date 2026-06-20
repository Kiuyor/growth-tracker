export const POMODORO_TIERS = [
  { minMinutes: 15, points: 3 },
  { minMinutes: 25, points: 5 },
  { minMinutes: 45, points: 8 },
  { minMinutes: 60, points: 10 },
] as const;

export function calcPomodoroPoints(actualMinutes: number): number {
  const validMinutes = Math.max(0, Math.floor(actualMinutes));
  for (let i = POMODORO_TIERS.length - 1; i >= 0; i--) {
    if (validMinutes >= POMODORO_TIERS[i].minMinutes) {
      return POMODORO_TIERS[i].points;
    }
  }
  return 0;
}

export function getPomodoroTierLabel(minutes: number): string {
  if (minutes >= 60) return "60 分钟";
  if (minutes >= 45) return "45 分钟";
  if (minutes >= 25) return "25 分钟";
  if (minutes >= 15) return "15 分钟";
  return "低于 15 分钟";
}
