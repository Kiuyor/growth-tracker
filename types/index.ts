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

export interface PointLog {
  id: string;
  userId: string;
  amount: number;
  balance: number;
  source: string;
  sourceId: string | null;
  description: string;
  createdAt: string;
}
