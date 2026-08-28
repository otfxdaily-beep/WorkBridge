import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import type { ApplicationStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "My Applications" };

export const statusTone: Record<ApplicationStatus, "neutral" | "brand" | "warning" | "success" | "danger"> = {
  APPLIED: "brand",
  VIEWED: "brand",
  SHORTLISTED: "warning",
  INTERVIEW: "warning",
  OFFER: "success",
  HIRED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

export default async function ApplicationsPage() {
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const applications = await prisma.application.findMany({
    where: { jobSeekerProfileId: profile.id },
    include: { job: { include: { company: true, location: true } } },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">My applications</h1>
      <p className="mt-1 text-slate-600">Track the status of every job you&apos;ve applied to.</p>

      {applications.length === 0 && (
        <Card className="mt-6 text-center text-sm text-slate-500">
          You haven&apos;t applied to any jobs yet.{" "}
          <Link href="/jobs" className="text-brand-600 hover:underline">
            Browse jobs
          </Link>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {applications.map((app) => (
          <Link key={app.id} href={`/dashboard/applications/${app.id}`}>
            <Card className="flex flex-col gap-2 transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{app.job.title}</span>
                  <Badge tone={statusTone[app.status]}>{titleCase(app.status)}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {app.job.company.name} &middot; {app.job.location.city}, {app.job.location.state}
                </p>
              </div>
              <p className="text-xs text-slate-400">Applied {formatRelativeDate(app.appliedAt)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
