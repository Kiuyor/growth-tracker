"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MOOD_PRESET_TAGS } from "@/lib/mood-rules";
import { X } from "lucide-react";

interface MoodTagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MoodTagSelector({
  value,
  onChange,
  disabled,
}: MoodTagSelectorProps) {
  const [input, setInput] = useState("");

  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else if (value.length < 5) {
      onChange([...value, tag]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const tag = input.trim();
    if (!tag) return;
    if (!value.includes(tag) && value.length < 5) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">心情标签（最多 5 个）</label>
      <div className="flex flex-wrap gap-2">
        {MOOD_PRESET_TAGS.map((tag) => {
          const selected = value.includes(tag);
          return (
            <Button
              key={tag}
              type="button"
              variant={selected ? "default" : "outline"}
              size="sm"
              disabled={disabled || (!selected && value.length >= 5)}
              onClick={() => toggleTag(tag)}
              className={cn("text-xs", selected && "ring-2 ring-primary ring-offset-1")}
            >
              {tag}
            </Button>
          );
        })}
      </div>
      <Input
        placeholder="输入自定义标签，按回车添加"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || value.length >= 5}
        className="text-sm"
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="rounded-full hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
