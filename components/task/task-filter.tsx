"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface TaskFilterProps {
  status: string;
  priority: string;
  category: string;
}

export function TaskFilter({ status, priority, category }: TaskFilterProps) {
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (key === "status" ? value : status) {
      const v = key === "status" ? value : status;
      if (v) params.set("status", v);
    }
    if (key === "priority" ? value : priority) {
      const v = key === "priority" ? value : priority;
      if (v) params.set("priority", v);
    }
    if (key === "category" ? value : category) {
      const v = key === "category" ? value : category;
      if (v) params.set("category", v);
    }
    router.push(`/tasks?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={status}
        onChange={(e) => updateFilter("status", e.target.value)}
      >
        <option value="">所有状态</option>
        <option value="TODO">待办</option>
        <option value="IN_PROGRESS">进行中</option>
        <option value="DONE">已完成</option>
      </Select>
      <Select
        value={priority}
        onChange={(e) => updateFilter("priority", e.target.value)}
      >
        <option value="">所有优先级</option>
        <option value="HIGH">高</option>
        <option value="MEDIUM">中</option>
        <option value="LOW">低</option>
      </Select>
      <Button
        variant="outline"
        onClick={() => router.push("/tasks")}
      >
        重置筛选
      </Button>
    </div>
  );
}
