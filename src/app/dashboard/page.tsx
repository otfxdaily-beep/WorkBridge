import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import { applicationStatusTone } from "@/lib/applications";
import { calculateMatch, buildCandidateMatchInput, buildJobMatchInput } from "@/lib/matching";
import { toJobCardData } from "@/lib/jobs";

export const metadata: Metadata = { title: "Dashboard" };

const RECOMMENDATION_POOL_CAP = 100;
const RECOMMENDATION_COUNT = 3;

export default async function JobSeekerDashboardPage() {
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: {
      skills: { include: { skill: true } },
      experiences: true,
      educations: true,
      preference: { include: { location: true } },
      location: true,
    },
  });

  const [recentApplications, appliedJobIds] = await Promise.all([
    prisma.application.findMany({
      where: { jobSeekerProfileId: profile.id },
      include: { job: { include: { company: true } } },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }),
    prisma.application.findMany({ where: { jobSeekerProfileId: profile.id }, select: { jobId: true } }),
  ]);

  const candidatePool = await prisma.job.findMany({
    where: { status: "PUBLISHED", id: { notIn: appliedJobIds.map((a) => a.jobId) } },
    include: { company: true, location: true, skills: { include: { skill: true } } },
    orderBy: { publishedAt: "desc" },
    take: RECOMMENDATION_POOL_CAP,
  });

  const candidateInput = buildCandidateMatchInput(profile);
  const recommendedJobs = candidatePool
    .map((job) => ({ job, matchScore: calculateMatch(candidateInput, buildJobMatchInput(job)).score }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, RECOMMENDATION_COUNT);

  const completion = calculateProfileCompletion(profile);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        {greeting}, {profile.fullName.split(" ")[0]}
      </h1>

      {completion < 100 && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-brand-900">Your profile is {completion}% complete</p>
            <p className="text-sm text-brand-700">
              Finish your profile so employers see your best self &mdash; and so we can match you to jobs.
            </p>
          </div>
          <ButtonLink href="/dashboard/profile" size="sm" className="shrink-0">
            Complete profile
          </ButtonLink>
        </div>
      )}

      {recommendedJobs.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recommended for you</h2>
            <ButtonLink href="/jobs" size="sm" variant="secondary">
              Browse all jobs
            </ButtonLink>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedJobs.map(({ job, matchScore }) => (
              <JobCard key={job.id} job={toJobCardData(job, matchScore)} />
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent applications</h2>
        <ButtonLink href="/jobs" size="sm" variant="secondary">
          Browse jobs
        </ButtonLink>
      </div>

      {recentApplications.length === 0 ? (
        <Card className="mt-3 text-center text-sm text-slate-500">
          You haven&apos;t applied to any jobs yet.
        </Card>
      ) : (
        <div className="mt-3 space-y-3">
          {recentApplications.map((app) => (
            <Link key={app.id} href={`/dashboard/applications/${app.id}`}>
              <Card className="flex flex-col gap-2 transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{app.job.title}</span>
                    <Badge tone={applicationStatusTone[app.status]}>{titleCase(app.status)}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{app.job.company.name}</p>
                </div>
                <p className="text-xs text-slate-400">Applied {formatRelativeDate(app.appliedAt)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
