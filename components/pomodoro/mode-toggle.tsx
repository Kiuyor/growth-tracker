"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Timer, Clock } from "lucide-react";
import type { TimerMode } from "@/types";

interface ModeToggleProps {
  value: TimerMode;
  onChange: (value: TimerMode) => void;
  disabled?: boolean;
}

export function ModeToggle({ value, onChange, disabled }: ModeToggleProps) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border p-1">
      <Button
        type="button"
        variant={value === "COUNTDOWN" ? "default" : "ghost"}
        size="sm"
        disabled={disabled}
        onClick={() => onChange("COUNTDOWN")}
        className={cn("gap-2", value === "COUNTDOWN" && "shadow-sm")}
      >
        <Timer className="h-4 w-4" />
        倒计时
      </Button>
      <Button
        type="button"
        variant={value === "STOPWATCH" ? "default" : "ghost"}
        size="sm"
        disabled={disabled}
        onClick={() => onChange("STOPWATCH")}
        className={cn("gap-2", value === "STOPWATCH" && "shadow-sm")}
      >
        <Clock className="h-4 w-4" />
        正计时
      </Button>
    </div>
  );
}
