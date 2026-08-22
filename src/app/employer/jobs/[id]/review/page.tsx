import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatSalaryRange, titleCase } from "@/lib/utils";
import { publishJobAction } from "../../actions";

export const metadata: Metadata = { title: "Review Job" };

export default async function ReviewJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("EMPLOYER");
  const employerProfile = await prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const job = await prisma.job.findUnique({
    where: { id },
    include: { location: true, category: true, skills: { include: { skill: true } } },
  });

  if (!job) notFound();
  if (job.companyId !== employerProfile.companyId) redirect("/employer/jobs");

  const boundPublish = publishJobAction.bind(null, job.id);
  const canPublish = job.status === "DRAFT" || job.status === "REJECTED";

  return (
    <Container className="max-w-3xl space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Review your job</h1>
          <p className="mt-1 text-slate-600">Check everything looks right before submitting.</p>
        </div>
        <Badge tone={job.status === "PUBLISHED" ? "success" : job.status === "REJECTED" ? "danger" : "warning"}>
          {titleCase(job.status)}
        </Badge>
      </div>

      {job.status === "REJECTED" && job.rejectionReason && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Rejected: {job.rejectionReason}. Edit and resubmit below.
        </p>
      )}

      <Card>
        <h2 className="text-xl font-semibold text-slate-900">{job.title}</h2>
        <p className="text-sm text-slate-500">
          {job.category.name} &middot; {job.location.city}, {job.location.state}
          {job.area ? ` (${job.area})` : ""}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{titleCase(job.employmentType)}</Badge>
          <Badge>{titleCase(job.workArrangement)}</Badge>
          <Badge>{titleCase(job.experienceLevel)} level</Badge>
          <Badge>{job.numberOfOpenings} opening{job.numberOfOpenings > 1 ? "s" : ""}</Badge>
        </div>

        <p className="mt-4 font-medium text-slate-900">
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryFrequency)}
        </p>

        {job.deadline && (
          <p className="mt-1 text-sm text-slate-500">
            Deadline: {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(job.deadline)}
          </p>
        )}

        <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Description</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{job.description}</p>
          </div>
          {job.responsibilities && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Responsibilities</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Requirements</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{job.requirements}</p>
            </div>
          )}
          {job.benefits && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Benefits</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{job.benefits}</p>
            </div>
          )}
          {job.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Skills</h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <Badge key={s.id} tone="brand">
                    {s.skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={`/employer/jobs/${job.id}/edit`} variant="secondary">
          Edit
        </ButtonLink>
        {canPublish && (
          <form action={boundPublish}>
            <Button type="submit">Publish Vacancy</Button>
          </form>
        )}
        {!canPublish && (
          <p className="text-sm text-slate-500">
            <Link href="/employer/jobs" className="text-brand-600 hover:underline">
              Back to my jobs
            </Link>
          </p>
        )}
      </div>
    </Container>
  );
}
