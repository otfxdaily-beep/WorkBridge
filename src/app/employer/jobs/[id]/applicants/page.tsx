import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireOwnedJob } from "@/lib/employer-guards";
import { ApplicantCard, type ApplicantCardData } from "@/components/employer/applicant-card";
import { APPLICANT_TABS, type ApplicantTab } from "@/lib/applications";
import type { ApplicationStatus, Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Applicants" };

const TAB_LABELS: Record<ApplicantTab, string> = {
  ALL: "All",
  NEW: "New",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

function statusForTab(tab: ApplicantTab): ApplicationStatus[] | null {
  switch (tab) {
    case "NEW":
      return ["APPLIED"];
    case "SHORTLISTED":
      return ["SHORTLISTED"];
    case "INTERVIEW":
      return ["INTERVIEW"];
    case "OFFER":
      return ["OFFER"];
    case "HIRED":
      return ["HIRED"];
    case "REJECTED":
      return ["REJECTED"];
    default:
      return null;
  }
}

export default async function ApplicantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id: jobId } = await params;
  const { tab: rawTab } = await searchParams;
  const job = await requireOwnedJob(jobId);
  if (!job) notFound();

  const tab = (APPLICANT_TABS as readonly string[]).includes(rawTab ?? "") ? (rawTab as ApplicantTab) : "ALL";
  const statusFilter = statusForTab(tab);

  const where: Prisma.ApplicationWhereInput = { jobId };
  if (statusFilter) where.status = { in: statusFilter };

  const applications = await prisma.application.findMany({
    where,
    include: {
      jobSeekerProfile: {
        include: {
          user: { select: { emailVerified: true } },
          location: true,
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  const counts = await prisma.application.groupBy({ by: ["status"], where: { jobId }, _count: true });
  const countFor = (statuses: ApplicationStatus[] | null) =>
    statuses ? counts.filter((c) => statuses.includes(c.status)).reduce((s, c) => s + c._count, 0) : counts.reduce((s, c) => s + c._count, 0);

  const applicants: ApplicantCardData[] = applications.map((app) => ({
    applicationId: app.id,
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    fullName: app.jobSeekerProfile.fullName,
    photoUrl: app.jobSeekerProfile.photoUrl,
    professionalTitle: app.jobSeekerProfile.professionalTitle,
    city: app.jobSeekerProfile.location?.city ?? "—",
    state: app.jobSeekerProfile.location?.state ?? "",
    yearsOfExperience: app.jobSeekerProfile.yearsOfExperience,
    skills: app.jobSeekerProfile.skills.map((s) => s.skill.name),
    emailVerified: app.jobSeekerProfile.user.emailVerified,
    matchScore: app.matchScore,
  }));

  return (
    <Container className="py-10">
      <div>
        <Link href="/employer/jobs" className="text-sm text-brand-600 hover:underline">
          &larr; My jobs
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Applicants</h1>
        <p className="mt-1 text-slate-600">{job.title}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {APPLICANT_TABS.map((t) => (
          <Link
            key={t}
            href={t === "ALL" ? `/employer/jobs/${jobId}/applicants` : `/employer/jobs/${jobId}/applicants?tab=${t}`}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium",
              tab === t ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {TAB_LABELS[t]} ({countFor(statusForTab(t))})
          </Link>
        ))}
      </div>

      {applicants.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">No applicants in this stage yet.</Card>
      ) : (
        <div className="mt-6 space-y-4">
          {applicants.map((applicant) => (
            <ApplicantCard key={applicant.applicationId} jobId={jobId} applicant={applicant} />
          ))}
        </div>
      )}
    </Container>
  );
}
