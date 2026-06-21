import type { Priority, TaskStatus, PointSource, ShopItemType } from "@/types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "待办",
  IN_PROGRESS: "进行中",
  DONE: "已完成",
  ARCHIVED: "已归档",
};

export const STATUS_BADGE_VARIANT: Record<
  TaskStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  DONE: "outline",
  ARCHIVED: "secondary",
};

export const POINT_SOURCE_LABEL: Record<PointSource, string> = {
  TASK_COMPLETE: "完成任务",
  DAILY_CHECK: "每日打卡",
  POMODORO: "番茄钟",
  ACHIEVEMENT: "成就",
  STREAK_BONUS: "连续奖励",
  SHOP_SPEND: "积分消费",
  MANUAL_ADJUST: "手动调整",
  MOOD_ENTRY: "心情随记",
  MOOD_STREAK: "心情连续",
};

export const SHOP_TYPE_LABEL: Record<ShopItemType, string> = {
  REWARD: "奖励",
  DECORATION: "装扮",
  CONSUMABLE: "消耗品",
};
