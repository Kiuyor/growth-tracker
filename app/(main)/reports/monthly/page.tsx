import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildReportStats } from "@/lib/reports";
import { ReportClient } from "../report-client";

export const metadata: Metadata = {
  title: "月报 | 成长追踪",
  description: "查看你的每月成长报告，回顾整月的成长轨迹",
};

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const { offset } = await searchParams;
  const safeOffset = parseInt(offset || "0", 10) || 0;

  const data = await buildReportStats(session.userId, "monthly", safeOffset);
  return <ReportClient type="monthly" initialData={data} />;
}
