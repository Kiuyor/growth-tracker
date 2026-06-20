"use client";

import { format, isToday, isYesterday } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tagsToArray, getMoodLabel } from "@/lib/mood-rules";
import type { MoodEntry } from "@/types";

interface MoodTimelineProps {
  entries: MoodEntry[];
}

function groupDateLabel(date: Date): string {
  if (isToday(date)) return "今天";
  if (isYesterday(date)) return "昨天";
  return format(date, "M月d日", { locale: zhCN });
}

export function MoodTimeline({ entries }: MoodTimelineProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">心情时间线</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            还没有心情记录，写下第一条吧！
          </p>
        </CardContent>
      </Card>
    );
  }

  const groups: { label: string; items: MoodEntry[] }[] = [];
  entries.forEach((entry) => {
    const label = groupDateLabel(new Date(entry.createdAt));
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  });

  const MOOD_EMOJIS = ["😫", "😟", "😐", "🙂", "😄"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">心情时间线</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
              {group.label}
            </h4>
            <div className="space-y-3">
              {group.items.map((entry) => {
                const tagList = tagsToArray(entry.tags);
                return (
                  <div
                    key={entry.id}
                    className="rounded-lg border p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {MOOD_EMOJIS[entry.moodScore - 1]}
                        </span>
                        <span className="text-sm font-medium">
                          {getMoodLabel(entry.moodScore)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(entry.createdAt),
                          "HH:mm",
                          { locale: zhCN }
                        )}
                      </span>
                    </div>
                    <p className="mb-2 text-sm whitespace-pre-wrap">{entry.content}</p>
                    {tagList.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tagList.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
