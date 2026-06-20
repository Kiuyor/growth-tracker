"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MoodScorePicker } from "./mood-score-picker";
import { MoodTagSelector } from "./mood-tag-selector";

interface MoodFormProps {
  todayRecorded: boolean;
  onSuccess: () => void;
}

export function MoodForm({ todayRecorded, onSuccess }: MoodFormProps) {
  const [content, setContent] = useState("");
  const [moodScore, setMoodScore] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || moodScore < 1) return;

    setLoading(true);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, moodScore, tags }),
      });
      const data = (await res.json()) as {
        totalPoints: number;
        streak: number;
        error?: string;
      };

      if (!res.ok) {
        window.alert(data.error || "记录失败");
        return;
      }

      const msg =
        data.totalPoints > 0
          ? `记录成功！获得 ${data.totalPoints} 积分${
              data.streak > 0 ? `，当前连续 ${data.streak} 天` : ""
            }`
          : "记录成功！";
      window.alert(msg);

      setContent("");
      setMoodScore(0);
      setTags([]);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">记录心情</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <MoodScorePicker
            value={moodScore}
            onChange={setMoodScore}
            disabled={loading}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="mood-content">
              写下你的想法
            </label>
            <Textarea
              id="mood-content"
              placeholder="今天发生了什么？心情如何？"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              maxLength={500}
              rows={4}
            />
            <div className="text-right text-xs text-muted-foreground">
              {content.length}/500
            </div>
          </div>

          <MoodTagSelector
            value={tags}
            onChange={setTags}
            disabled={loading}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading || !content.trim() || moodScore < 1 || todayRecorded
            }
          >
            {todayRecorded ? "今日已记录" : "保存心情"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
