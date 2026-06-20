import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buildReportStats } from "@/lib/reports";
import { ReportClient } from "../report-client";

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
