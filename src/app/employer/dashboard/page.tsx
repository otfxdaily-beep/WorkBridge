import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { VerifiedBadge, Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Employer Dashboard" };

export default async function EmployerDashboardPage() {
  const user = await requireRole("EMPLOYER");
  const profile = await prisma.employerProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: { company: true },
  });

  const company = profile.company;
  const jobCounts = company
    ? await prisma.job.groupBy({ by: ["status"], where: { companyId: company.id }, _count: true })
    : [];
  const countFor = (status: string) => jobCounts.find((c) => c.status === status)?._count ?? 0;
  const activeJobs = countFor("PUBLISHED") + countFor("PENDING_REVIEW");

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        Welcome, {profile.fullName.split(" ")[0]}
      </h1>

      {!company && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-brand-900">Set up your company profile</p>
            <p className="text-sm text-brand-700">
              Add your company details before you can post vacancies.
            </p>
          </div>
          <ButtonLink href="/employer/company" size="sm" className="shrink-0">
            Create company profile
          </ButtonLink>
        </div>
      )}

      {company && company.verificationStatus !== "VERIFIED" && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {company.verificationStatus === "PENDING" ? (
              <Badge tone="warning">Verification pending</Badge>
            ) : (
              <Badge tone="neutral">Not verified</Badge>
            )}
            <p className="text-sm text-amber-800">
              Get verified so job seekers see {company.name} as a trusted employer.
            </p>
          </div>
          <ButtonLink href="/employer/company" variant="secondary" size="sm" className="shrink-0">
            Manage verification
          </ButtonLink>
        </div>
      )}

      {company && company.verificationStatus === "VERIFIED" && (
        <div className="mt-4 flex items-center gap-2">
          <VerifiedBadge />
          <span className="text-sm text-slate-600">{company.name} is a verified employer.</span>
        </div>
      )}

      {company && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <p className="text-2xl font-semibold text-slate-900">{activeJobs}</p>
              <p className="text-sm text-slate-500">Active jobs</p>
            </Card>
            <Card>
              <p className="text-2xl font-semibold text-slate-900">{countFor("DRAFT")}</p>
              <p className="text-sm text-slate-500">Drafts</p>
            </Card>
            <Card>
              <p className="text-2xl font-semibold text-slate-900">{countFor("PENDING_REVIEW")}</p>
              <p className="text-sm text-slate-500">Pending review</p>
            </Card>
            <Card>
              <p className="text-2xl font-semibold text-slate-900">{countFor("CLOSED")}</p>
              <p className="text-sm text-slate-500">Closed</p>
            </Card>
          </div>

          <div className="mt-6">
            <ButtonLink href="/employer/jobs/new">Post a job</ButtonLink>
          </div>
        </>
      )}

      <p className="mt-6 max-w-lg text-slate-600">
        Applicant management will appear here once the Applicant Management
        stage is built.
      </p>
    </Container>
  );
}
