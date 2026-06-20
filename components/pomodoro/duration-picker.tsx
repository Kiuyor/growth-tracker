"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESETS = [15, 25, 45, 60];

interface DurationPickerProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function DurationPicker({ value, onChange, disabled }: DurationPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={value === preset ? "default" : "outline"}
            size="sm"
            disabled={disabled}
            onClick={() => onChange(preset)}
          >
            {preset} 分钟
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">自定义</span>
        <Input
          type="number"
          min={1}
          max={180}
          value={value}
          onChange={(e) => onChange(Math.max(1, Math.min(180, Number(e.target.value) || 0)))}
          disabled={disabled}
          className={cn("w-20 text-center", disabled && "opacity-50")}
        />
        <span className="text-sm text-muted-foreground">分钟</span>
      </div>
    </div>
  );
}
