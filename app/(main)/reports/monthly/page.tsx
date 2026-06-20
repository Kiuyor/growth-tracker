import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReportClient } from "../report-client";
import type { ReportStats } from "@/types";

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const { offset } = await searchParams;
  const safeOffset = parseInt(offset || "0", 10) || 0;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/reports?type=monthly&offset=${safeOffset}`,
    {
      headers: {
        cookie: "",
      },
    }
  );

  if (!res.ok) {
    redirect("/");
  }

  const data = (await res.json()) as ReportStats;

  return <ReportClient type="monthly" initialData={data} />;
}
