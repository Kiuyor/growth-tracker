export interface DailyCheck {
  id: string;
  userId: string;
  date: string;
  checked: boolean;
  streak: number;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
export type ShopItemType = "REWARD" | "DECORATION" | "CONSUMABLE";
export type UserItemStatus = "UNUSED" | "USED" | "EXPIRED";
export type PointSource =
  | "TASK_COMPLETE"
  | "DAILY_CHECK"
  | "POMODORO"
  | "ACHIEVEMENT"
  | "STREAK_BONUS"
  | "SHOP_SPEND"
  | "MANUAL_ADJUST"
  | "MOOD_ENTRY"
  | "MOOD_STREAK";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  deadline: string | null;
  category: string | null;
  points: number;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: ShopItemType;
  cost: number;
  sortOrder: number;
  isActive: boolean;
  limitConfig: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserItem {
  id: string;
  userId: string;
  shopItemId: string;
  status: UserItemStatus;
  usedAt: string | null;
  createdAt: string;
  shopItem: ShopItem;
  useLogs: InventoryUseLog[];
}

export interface InventoryUseLog {
  id: string;
  userItemId: string;
  note: string | null;
  createdAt: string;
}

export interface Pomodoro {
  id: string;
  userId: string;
  duration: number;
  taskId: string | null;
  startedAt: string;
  endedAt: string | null;
  taskTitle?: string | null;
  points?: number;
}

export interface PomodoroStats {
  todayMinutes: number;
  todayCount: number;
  weekMinutes: number;
  totalCount: number;
}

export type TimerMode = "COUNTDOWN" | "STOPWATCH";
export type TimerState = "idle" | "running" | "paused";

export interface MoodEntry {
  id: string;
  userId: string;
  content: string;
  moodScore: number;
  tags: string[];
  createdAt: string;
}

export interface MoodStats {
  totalEntries: number;
  currentStreak: number;
  averageMood: number;
  todayRecorded: boolean;
}

export interface DailyStat {
  date: string;
  checkIn: boolean;
  pomodoroCount: number;
  pomodoroMinutes: number;
  moodScore: number | null;
  tasksCompleted: number;
  pointsEarned: number;
  streak?: number;
}

export interface OverviewStats {
  daily: DailyStat[];
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    byPriority: { priority: Priority; count: number }[];
    byCategory: { category: string; count: number }[];
  };
  pointsBySource: { source: PointSource; amount: number }[];
  pomodoroByHour: { hour: number; count: number }[];
}

export interface HeatmapData {
  year: number;
  data: { date: string; value: number; streak: number }[];
}

export type TimeRange = "7" | "30";

export interface ReportPeriod {
  start: string;
  end: string;
  label: string;
}

export interface ReportHighlights {
  mostFocusDay: { date: string; minutes: number } | null;
  mostTasksDay: { date: string; count: number } | null;
  bestMoodDay: { date: string; score: number } | null;
}

export interface ReportStats {
  type: "weekly" | "monthly";
  current: ReportPeriod;
  previous: ReportPeriod;
  summary: {
    pomodoroMinutes: number;
    pomodoroCount: number;
    tasksCompleted: number;
    checkInDays: number;
    moodAverage: number | null;
    pointsEarned: number;
  };
  comparison: {
    pomodoroMinutes: number;
    pomodoroCount: number;
    tasksCompleted: number;
    checkInDays: number;
    moodAverage: number | null;
    pointsEarned: number;
  };
  streak: {
    start: number;
    end: number;
    change: number;
  };
  highlights: ReportHighlights;
  daily: DailyStat[];
}
