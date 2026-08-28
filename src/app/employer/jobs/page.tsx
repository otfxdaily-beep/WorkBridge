import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatSalaryRange, titleCase, formatRelativeDate } from "@/lib/utils";
import { closeJobAction } from "./actions";
import type { JobStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "My Jobs" };

const statusTone: Record<JobStatus, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
  CLOSED: "neutral",
  EXPIRED: "neutral",
};

export default async function EmployerJobsPage() {
  const user = await requireRole("EMPLOYER");
  const employerProfile = await prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const jobs = employerProfile.companyId
    ? await prisma.job.findMany({
        where: { companyId: employerProfile.companyId },
        include: { location: true, _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My jobs</h1>
          <p className="mt-1 text-slate-600">Manage the vacancies you&apos;ve posted.</p>
        </div>
        <ButtonLink href="/employer/jobs/new">
          <Plus className="size-4" />
          Post a job
        </ButtonLink>
      </div>

      {jobs.length === 0 && (
        <Card className="mt-6 text-center text-sm text-slate-500">
          You haven&apos;t posted any jobs yet.
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {jobs.map((job) => {
          const detailHref = `/employer/jobs/${job.id}/review`;

          return (
            <Card key={job.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={detailHref} className="font-semibold text-slate-900 hover:text-brand-600">
                    {job.title}
                  </Link>
                  <Badge tone={statusTone[job.status]}>{titleCase(job.status)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {job.location.city}, {job.location.state} &middot;{" "}
                  {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryFrequency)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">Created {formatRelativeDate(job.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ButtonLink href={`/employer/jobs/${job.id}/applicants`} size="sm">
                  {job._count.applications} Applicant{job._count.applications === 1 ? "" : "s"}
                </ButtonLink>
                <ButtonLink href={detailHref} variant="secondary" size="sm">
                  View
                </ButtonLink>
                {(job.status === "PUBLISHED" || job.status === "PENDING_REVIEW") && (
                  <form action={closeJobAction.bind(null, job.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Close
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
