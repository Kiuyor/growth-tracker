export const CHECK_IN_BASE_POINTS = 5;

export interface MilestoneRule {
  days: number;
  bonus: number;
  label: string;
}

export const STREAK_MILESTONES: MilestoneRule[] = [
  { days: 3, bonus: 5, label: "连续 3 天" },
  { days: 7, bonus: 15, label: "连续 7 天" },
  { days: 14, bonus: 30, label: "连续 14 天" },
  { days: 30, bonus: 80, label: "连续 30 天" },
  { days: 60, bonus: 200, label: "连续 60 天" },
  { days: 100, bonus: 500, label: "连续 100 天" },
];

export function getMilestoneBonus(streak: number): MilestoneRule | null {
  return STREAK_MILESTONES.find((m) => m.days === streak) || null;
}

export function getNextMilestone(streak: number): MilestoneRule | null {
  return STREAK_MILESTONES.find((m) => m.days > streak) || null;
}
