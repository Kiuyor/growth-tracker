"use client";

import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Trash2, Edit, Trophy } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityMap: Record<string, { label: string; color: string }> = {
  HIGH: { label: "高", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  MEDIUM: { label: "中", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
  LOW: { label: "低", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
};

const statusMap: Record<
  string,
  { label: string; icon: typeof Circle }
> = {
  TODO: { label: "待办", icon: Circle },
  IN_PROGRESS: { label: "进行中", icon: Clock },
  DONE: { label: "已完成", icon: CheckCircle2 },
};

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const router = useRouter();
  const StatusIcon = statusMap[task.status].icon;

  return (
    <Card className={task.status === "DONE" ? "opacity-75" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusIcon
              className={`h-5 w-5 ${
                task.status === "DONE" ? "text-green-500" : "text-muted-foreground"
              }`}
            />
            <CardTitle className="text-base">{task.title}</CardTitle>
          </div>
          <Badge className={priorityMap[task.priority].color}>
            {priorityMap[task.priority].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {task.category && <Badge variant="outline">{task.category}</Badge>}
          {task.deadline && (
            <span>
              截止：{format(new Date(task.deadline), "M月d日 HH:mm", { locale: zhCN })}
            </span>
          )}
          {task.points > 0 && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Trophy className="h-3 w-3" />+{task.points} 积分
            </span>
          )}
        </div>
        {task.subtasks.length > 0 && (
          <ul className="mt-3 space-y-1">
            {task.subtasks.map((sub) => (
              <li
                key={sub.id}
                className={`text-sm ${
                  sub.completed ? "text-muted-foreground line-through" : ""
                }`}
              >
                • {sub.title}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {task.status !== "DONE" && (
          <Button
            size="sm"
            onClick={() => onComplete(task.id)}
          >
            完成
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/tasks/${task.id}/edit`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
