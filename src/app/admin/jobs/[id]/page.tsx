import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";
import { formatSalaryRange, formatRelativeDate, titleCase } from "@/lib/utils";
import { approveJobAction, removeJobAction } from "../actions";
import { RejectJobForm } from "./reject-form";

export const metadata: Metadata = { title: "Review Job" };

export default async function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();

  const job = await prisma.job.findUnique({
    where: { id },
    include: { company: true, location: true, category: true, skills: { include: { skill: true } } },
  });

  if (!job) notFound();

  const isPending = job.status === "PENDING_REVIEW";
  const canRemove = job.status === "PUBLISHED" || job.status === "PENDING_REVIEW";

  return (
    <Container className="max-w-2xl py-10">
      <Link href="/admin/jobs" className="text-sm text-brand-600 hover:underline">
        &larr; Jobs
      </Link>

      <Card className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{job.title}</h1>
            <p className="text-sm text-slate-600">
              {job.company.name} &middot; {job.location.city}, {job.location.state}
              {job.area ? ` (${job.area})` : ""}
            </p>
            <p className="mt-1 text-xs text-slate-400">Submitted {formatRelativeDate(job.createdAt)}</p>
          </div>
          <Badge
            tone={job.status === "PUBLISHED" ? "success" : job.status === "REJECTED" ? "danger" : job.status === "PENDING_REVIEW" ? "warning" : "neutral"}
          >
            {titleCase(job.status)}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{titleCase(job.employmentType)}</Badge>
          <Badge>{titleCase(job.workArrangement)}</Badge>
          <Badge>{titleCase(job.experienceLevel)} level</Badge>
          <Badge>{job.category.name}</Badge>
        </div>

        <p className="mt-3 font-medium text-slate-900">
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryFrequency)}
        </p>

        {job.status === "REJECTED" && job.rejectionReason && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Rejected: {job.rejectionReason}
          </p>
        )}

        <div className="mt-5 space-y-4 border-t border-slate-100 pt-5 text-sm text-slate-600">
          <div>
            <h2 className="font-semibold text-slate-900">Description</h2>
            <p className="mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
          {job.responsibilities && (
            <div>
              <h2 className="font-semibold text-slate-900">Responsibilities</h2>
              <p className="mt-1 whitespace-pre-wrap">{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <h2 className="font-semibold text-slate-900">Requirements</h2>
              <p className="mt-1 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}
          {job.skills.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-900">Skills</h2>
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

        {isPending && (
          <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
            <form action={approveJobAction.bind(null, job.id)}>
              <Button type="submit">Approve &amp; publish</Button>
            </form>
            <RejectJobForm jobId={job.id} />
          </div>
        )}

        {!isPending && canRemove && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <form action={removeJobAction.bind(null, job.id)}>
              <Button type="submit" variant="danger" size="sm">
                Remove listing
              </Button>
            </form>
          </div>
        )}
      </Card>
    </Container>
  );
}
