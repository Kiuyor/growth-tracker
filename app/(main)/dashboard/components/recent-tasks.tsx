import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Task } from "@/types";

interface RecentTasksProps {
  tasks: Task[];
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <Card className="flex shrink-0 flex-col overflow-hidden md:h-[200px]">
      <CardHeader className="shrink-0 p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm md:text-base">最近任务</CardTitle>
          <Link href="/tasks">
            <Button variant="outline" size="sm" className="h-7 text-xs">查看全部</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-3 pt-0 scrollbar-thin">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有任务，去创建一个吧！</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-2 md:p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      task.status === "DONE" ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  <span className={`text-sm ${task.status === "DONE" ? "line-through" : ""}`}>
                    {task.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground md:text-sm">
                  {task.status === "DONE" ? "已完成" : "待完成"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
