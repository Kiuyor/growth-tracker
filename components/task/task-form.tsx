"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SubtaskInput } from "./subtask-input";

interface TaskFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    deadline: string | null;
    category: string | null;
    points: number;
    subtasks: { title: string; completed?: boolean }[];
  } | null;
}

export function TaskForm({ initialData }: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtasks, setSubtasks] = useState(
    initialData?.subtasks.map((s) => ({ title: s.title })) || []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      priority: (formData.get("priority") as string) || "MEDIUM",
      deadline: (formData.get("deadline") as string) || null,
      category: (formData.get("category") as string) || null,
      points: Number(formData.get("points")) || 0,
      subtasks,
    };

    try {
      const url = initialData ? `/api/tasks/${initialData.id}` : "/api/tasks";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save task");
      router.push("/tasks");
      router.refresh();
    } catch (err) {
      logger.error("Failed to save task", err);
      toast.error("保存失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          任务标题 *
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData?.title || ""}
          placeholder="例如：完成数学试卷一套"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          描述
        </label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          placeholder="补充说明任务内容"
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            优先级
          </label>
          <Select
            id="priority"
            name="priority"
            defaultValue={initialData?.priority || "MEDIUM"}
          >
            <option value="HIGH">高</option>
            <option value="MEDIUM">中</option>
            <option value="LOW">低</option>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="deadline" className="text-sm font-medium">
            截止时间
          </label>
          <Input
            id="deadline"
            name="deadline"
            type="datetime-local"
            defaultValue={
              initialData?.deadline
                ? new Date(initialData.deadline).toISOString().slice(0, 16)
                : ""
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            分类
          </label>
          <Input
            id="category"
            name="category"
            defaultValue={initialData?.category || ""}
            placeholder="例如：数学"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="points" className="text-sm font-medium">
            完成奖励积分
          </label>
          <Input
            id="points"
            name="points"
            type="number"
            min={0}
            defaultValue={initialData?.points || 10}
          />
        </div>
      </div>

      <SubtaskInput subtasks={subtasks} onChange={setSubtasks} />

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : initialData ? "更新任务" : "创建任务"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/tasks")}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
