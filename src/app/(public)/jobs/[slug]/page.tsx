import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, MapPin, Star, Flag, MessageCircle, Send } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCompanyRating } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/auth/session";
import { formatSalaryRange, formatRelativeDate, titleCase } from "@/lib/utils";
import { SaveJobButton } from "./save-job-button";

async function getJob(slug: string) {
  return prisma.job.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { company: true, location: true, category: true, skills: { include: { skill: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Job not found" };

  const description = `${job.title} at ${job.company.name} in ${job.location.city}, ${job.location.state}. ${job.description.slice(0, 140)}`;
  return {
    title: `${job.title} at ${job.company.name}`,
    description,
    openGraph: { title: `${job.title} at ${job.company.name}`, description, type: "article" },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  await prisma.job.update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } });

  const [rating, user] = await Promise.all([getCompanyRating(job.companyId), getCurrentUser()]);

  let isSaved = false;
  if (user?.role === "JOB_SEEKER") {
    const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } });
    if (profile) {
      isSaved = Boolean(
        await prisma.savedJob.findUnique({
          where: { jobSeekerProfileId_jobId: { jobSeekerProfileId: profile.id, jobId: job.id } },
        })
      );
    }
  }

  const isVerified = job.company.verificationStatus === "VERIFIED";

  return (
    <Container className="max-w-3xl py-10">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            {job.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.company.logoUrl} alt={job.company.name} className="size-14 rounded-xl object-cover" />
            ) : (
              <Building2 className="size-7" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">{job.title}</h1>
            <p className="mt-0.5 text-slate-600">{job.company.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {isVerified && <VerifiedBadge />}
              {rating.average && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {rating.average.toFixed(1)} ({rating.count} review{rating.count === 1 ? "" : "s"})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" />
            {job.location.city}, {job.location.state}
            {job.area ? ` (${job.area})` : ""}
          </span>
          <span>{job.category.name}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{titleCase(job.employmentType)}</Badge>
          <Badge>{titleCase(job.workArrangement)}</Badge>
          <Badge>{titleCase(job.experienceLevel)} level</Badge>
        </div>

        <p className="mt-4 text-lg font-semibold text-slate-900">
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryFrequency)}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Posted {formatRelativeDate(job.publishedAt ?? job.createdAt)}
          {job.deadline && ` · Deadline ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(job.deadline)}`}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="w-full sm:w-auto" disabled title="Applications open in the next build stage">
            <Send className="size-4" />
            Apply Now
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto" disabled title="Messaging opens in a later build stage">
            <MessageCircle className="size-4" />
            Message Employer
          </Button>
          <SaveJobButton jobId={job.id} slug={job.slug} isSaved={isSaved} />
          <Button variant="ghost" className="w-full sm:w-auto" disabled title="Reporting opens in a later build stage">
            <Flag className="size-4" />
            Report Job
          </Button>
        </div>

        <div className="mt-8 space-y-5 border-t border-slate-100 pt-6">
          <div>
            <h2 className="font-semibold text-slate-900">Description</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{job.description}</p>
          </div>
          {job.responsibilities && (
            <div>
              <h2 className="font-semibold text-slate-900">Responsibilities</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <h2 className="font-semibold text-slate-900">Requirements</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{job.requirements}</p>
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
          {job.benefits && (
            <div>
              <h2 className="font-semibold text-slate-900">Benefits</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{job.benefits}</p>
            </div>
          )}
        </div>
      </Card>
    </Container>
  );
}
