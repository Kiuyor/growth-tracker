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
