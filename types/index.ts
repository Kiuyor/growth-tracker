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

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
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
  type: string;
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
  status: string;
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
  tags: string;
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
}

export interface OverviewStats {
  daily: DailyStat[];
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    byPriority: { priority: string; count: number }[];
    byCategory: { category: string; count: number }[];
  };
  pointsBySource: { source: string; amount: number }[];
  pomodoroByHour: { hour: number; count: number }[];
}

export interface HeatmapData {
  year: number;
  data: { date: string; value: number; streak: number }[];
}

export type TimeRange = "7" | "30";
