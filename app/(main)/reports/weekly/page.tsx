import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildReportStats } from "@/lib/reports";
import { ReportClient } from "../report-client";

export const metadata: Metadata = {
  title: "周报 | 成长追踪",
  description: "查看你的每周成长报告，了解专注时长、任务完成和心情趋势",
};

export default async function WeeklyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const { offset } = await searchParams;
  const safeOffset = parseInt(offset || "0", 10) || 0;

  const data = await buildReportStats(session.userId, "weekly", safeOffset);
  return <ReportClient type="weekly" initialData={data} />;
}
