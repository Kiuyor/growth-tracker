"use client";

import { useState } from "react";
import { MoodForm } from "@/components/mood/mood-form";
import { MoodTimeline } from "@/components/mood/mood-timeline";
import { MoodStatsCards } from "@/components/mood/mood-stats-cards";
import type { MoodEntry, MoodStats } from "@/types";

interface MoodClientProps {
  initialEntries: MoodEntry[];
  initialStats: MoodStats;
}

export function MoodClient({ initialEntries, initialStats }: MoodClientProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [stats, setStats] = useState(initialStats);

  const refresh = async () => {
    const [entriesRes, statsRes] = await Promise.all([
      fetch("/api/mood?limit=20"),
      fetch("/api/mood/stats"),
    ]);

    if (entriesRes.ok) {
      const data = (await entriesRes.json()) as { entries: MoodEntry[] };
      setEntries(data.entries);
    }
    if (statsRes.ok) {
      const data = (await statsRes.json()) as MoodStats;
      setStats(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">心情随记</h2>
      </div>

      <MoodStatsCards stats={stats} />

      <MoodForm todayRecorded={stats.todayRecorded} onSuccess={refresh} />

      <MoodTimeline entries={entries} />
    </div>
  );
}
