import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate, formatSalaryRange, titleCase } from "@/lib/utils";
import type { JobStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Jobs" };

const STATUS_TONE: Record<JobStatus, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
  CLOSED: "neutral",
  EXPIRED: "neutral",
};

const TABS: { value: JobStatus | "ALL"; label: string }[] = [
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
  { value: "ALL", label: "All" },
];

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const activeTab = (TABS.find((t) => t.value === status)?.value ?? "PENDING_REVIEW") as JobStatus | "ALL";

  const jobs = await prisma.job.findMany({
    where: activeTab === "ALL" ? undefined : { status: activeTab },
    include: { company: true, location: true },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  const pendingCount = await prisma.job.count({ where: { status: "PENDING_REVIEW" } });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
      <p className="mt-1 text-slate-600">
        {pendingCount} job{pendingCount === 1 ? "" : "s"} awaiting review.
      </p>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "PENDING_REVIEW" ? "/admin/jobs" : `/admin/jobs?status=${tab.value}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">No jobs in this view.</Card>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/admin/jobs/${job.id}`}>
              <Card className="flex flex-col gap-2 transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{job.title}</span>
                    <Badge tone={STATUS_TONE[job.status]}>{titleCase(job.status)}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {job.company.name} &middot; {job.location.city}, {job.location.state}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryFrequency)}
                  </p>
                </div>
                <p className="text-xs text-slate-400">{formatRelativeDate(job.createdAt)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
