import { TaskForm } from "@/components/task/task-form";

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">新建任务</h2>
      <TaskForm />
    </div>
  );
}
