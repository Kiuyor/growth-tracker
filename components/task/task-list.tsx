"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/types";
import { TaskCard } from "./task-card";
import { TaskFilter } from "./task-filter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface TaskListProps {
  tasks: Task[];
  status: string;
  priority: string;
  category: string;
}

export function TaskList({ tasks, status, priority, category }: TaskListProps) {
  const router = useRouter();
  const [list, setList] = useState(tasks);

  async function handleComplete(id: string) {
    const res = await fetch(`/api/tasks/${id}/complete`, { method: "PATCH" });
    if (res.ok) {
      const data = await res.json();
      setList((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "DONE" } : t))
      );
      if (data.points) {
        alert(`恭喜！获得 ${data.points.log.amount} 积分`);
      }
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个任务吗？")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setList((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TaskFilter status={status} priority={priority} category={category} />
        <Link href="/tasks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建任务
          </Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          暂无任务，点击右上角新建一个吧
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
