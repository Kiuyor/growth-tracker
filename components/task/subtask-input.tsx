"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SubtaskInputProps {
  subtasks: { title: string }[];
  onChange: (subtasks: { title: string }[]) => void;
}

export function SubtaskInput({ subtasks, onChange }: SubtaskInputProps) {
  const [input, setInput] = useState("");

  function addSubtask() {
    if (!input.trim()) return;
    onChange([...subtasks, { title: input.trim() }]);
    setInput("");
  }

  function removeSubtask(index: number) {
    onChange(subtasks.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">子任务</label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="添加一个子步骤，按回车确认"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSubtask();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addSubtask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-1">
        {subtasks.map((sub, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            {sub.title}
            <button
              type="button"
              onClick={() => removeSubtask(index)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
