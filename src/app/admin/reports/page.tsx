import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import type { ReportStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Reports" };

const STATUS_TONE: Record<ReportStatus, "neutral" | "warning" | "success" | "danger"> = {
  OPEN: "warning",
  UNDER_REVIEW: "neutral",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

const TABS: { value: ReportStatus | "ALL"; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "ALL", label: "All" },
];

function targetSummary(report: {
  targetType: string;
  targetJob: { title: string } | null;
  targetUser: { email: string } | null;
  targetConversationId: string | null;
}) {
  if (report.targetType === "JOB") return report.targetJob ? `Job: ${report.targetJob.title}` : "Job (deleted)";
  if (report.targetType === "USER")
    return report.targetUser ? `User: ${report.targetUser.email}` : "User (deleted)";
  return report.targetConversationId ? "Message in conversation" : "Message";
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const activeTab = (TABS.find((t) => t.value === status)?.value ?? "OPEN") as ReportStatus | "ALL";

  const reports = await prisma.report.findMany({
    where: activeTab === "ALL" ? undefined : { status: activeTab },
    include: {
      reporter: true,
      targetJob: true,
      targetUser: true,
    },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  const openCount = await prisma.report.count({ where: { status: "OPEN" } });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
      <p className="mt-1 text-slate-600">
        {openCount} open report{openCount === 1 ? "" : "s"} awaiting review.
      </p>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "OPEN" ? "/admin/reports" : `/admin/reports?status=${tab.value}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">No reports in this view.</Card>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <Link key={r.id} href={`/admin/reports/${r.id}`}>
              <Card className="flex flex-col gap-2 transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{titleCase(r.reason)}</span>
                    <Badge tone={STATUS_TONE[r.status]}>{titleCase(r.status)}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{targetSummary(r)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Reported by {r.reporter.email}</p>
                </div>
                <p className="text-xs text-slate-400">{formatRelativeDate(r.createdAt)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
