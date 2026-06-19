import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PointsMallSection } from "@/components/shop/points-mall-section";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default async function PointsPage() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const [profile, logs] = await Promise.all([
    prisma.userProfile.findUnique({ where: { clerkId: session.userId } }),
    prisma.pointLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const sourceLabel: Record<string, string> = {
    TASK_COMPLETE: "完成任务",
    DAILY_CHECK: "每日打卡",
    POMODORO: "番茄钟",
    ACHIEVEMENT: "成就达成",
    STREAK_BONUS: "连续打卡奖励",
    SHOP_SPEND: "商店消费",
    MANUAL_ADJUST: "手动调整",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">积分记录</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            当前总积分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {profile?.totalPoints || 0}
          </div>
        </CardContent>
      </Card>

      <PointsMallSection />

      <Card>
        <CardHeader>
          <CardTitle>积分流水</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-muted-foreground">还没有积分记录，完成任务可以获得积分！</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{log.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{sourceLabel[log.source] || log.source}</Badge>
                      <span>
                        {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm", {
                          locale: zhCN,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        log.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {log.amount >= 0 ? "+" : ""}
                      {log.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      余额 {log.balance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
