"use client";

import { cn } from "@/lib/utils";
import { getMoodLabel, MOOD_EMOJIS } from "@/lib/mood-rules";

interface MoodScorePickerProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function MoodScorePicker({
  value,
  onChange,
  disabled,
}: MoodScorePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">今日心情</label>
      <div className="flex items-center justify-center gap-2">
        {MOOD_EMOJIS.map((emoji, index) => {
          const score = index + 1;
          const active = value === score;
          return (
            <button
              key={score}
              type="button"
              disabled={disabled}
              onClick={() => onChange(score)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all",
                active
                  ? "scale-110 bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2"
                  : "bg-muted hover:bg-muted/80",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title={getMoodLabel(score)}
            >
              {emoji}
            </button>
          );
        })}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        {value > 0 ? getMoodLabel(value) : "请选择心情评分"}
      </div>
    </div>
  );
}
