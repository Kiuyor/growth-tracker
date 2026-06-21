import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "成长报告 | 成长追踪",
  description: "查看你的周期性成长报告（自动跳转到周报）",
};

export default function ReportsIndexPage() {
  redirect("/reports/weekly");
}
