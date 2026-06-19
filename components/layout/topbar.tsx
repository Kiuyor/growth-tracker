"use client";

import { UserButton } from "@clerk/nextjs";
import { Coins } from "lucide-react";

interface TopbarProps {
  points?: number;
}

export function Topbar({ points = 0 }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h1 className="text-lg font-semibold md:text-xl">成长追踪</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-100">
          <Coins className="h-4 w-4" />
          {points} 积分
        </div>
        <UserButton />
      </div>
    </header>
  );
}
