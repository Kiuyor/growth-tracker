"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Task } from "@/types";
import { TaskCard } from "./task-card";
import { TaskFilter } from "./task-filter";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleComplete(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}/complete`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        if (data.points) {
          toast.success(`恭喜！获得 ${data.points.log.amount} 积分`);
        }
        router.refresh();
      }
    } catch {
      toast.error("网络错误，请稍后重试");
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/tasks/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("任务已删除");
        router.refresh();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("网络错误，请稍后重试");
    }
    setDeleteId(null);
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

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          暂无任务，点击右上角新建一个吧
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个任务吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
