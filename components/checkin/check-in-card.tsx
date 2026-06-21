"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, CheckCircle2 } from "lucide-react";
import { getNextMilestone, CHECK_IN_BASE_POINTS } from "@/lib/check-in-rules";

interface CheckInCardProps {
  checkedToday: boolean;
  currentStreak: number;
}

export function CheckInCard({ checkedToday, currentStreak }: CheckInCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckIn() {
    if (checkedToday) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        const msg = data.milestone
          ? `打卡成功！+${data.basePoints} 积分\n${data.milestone.label} 额外 +${data.milestone.bonus} 积分`
          : `打卡成功！+${data.basePoints} 积分`;
        toast.success(msg);
        router.refresh();
      } else if (res.status === 409) {
        toast.info("今日已打卡");
        router.refresh();
      } else {
        toast.error(data.error || "打卡失败");
      }
    } finally {
      setLoading(false);
    }
  }

  const nextMilestone = getNextMilestone(currentStreak);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          今日打卡
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="text-4xl font-bold">{currentStreak}</div>
          <Badge variant="secondary" className="mb-2">连续打卡天数</Badge>
        </div>

        {nextMilestone && (
          <p className="text-sm text-muted-foreground">
            再坚持 {nextMilestone.days - currentStreak} 天，可获得 +{nextMilestone.bonus} 积分奖励
          </p>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={checkedToday || loading}
          onClick={handleCheckIn}
        >
          {checkedToday ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              今日已打卡
            </>
          ) : loading ? (
            "打卡中..."
          ) : (
            `立即打卡 +${CHECK_IN_BASE_POINTS} 积分`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
