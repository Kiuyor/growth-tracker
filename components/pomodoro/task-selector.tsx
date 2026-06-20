"use client";

import { Select } from "@/components/ui/select";
import type { Task } from "@/types";

interface TaskSelectorProps {
  tasks: Task[];
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function TaskSelector({ tasks, value, onChange, disabled }: TaskSelectorProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">关联任务（可选）</label>
      <Select
        value={value || ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? val : null);
        }}
        disabled={disabled}
      >
        <option value="">不关联任务</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </Select>
    </div>
  );
}
