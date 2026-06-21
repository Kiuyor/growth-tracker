import { TaskForm } from "@/components/task/task-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新建任务 | 成长追踪",
  description: "创建一个新的成长任务",
};

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">新建任务</h2>
      <TaskForm />
    </div>
  );
}
