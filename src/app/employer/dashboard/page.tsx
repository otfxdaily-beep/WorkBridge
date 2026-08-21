import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { VerifiedBadge, Badge } from "@/components/ui/badge";
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

      <p className="mt-6 max-w-lg text-slate-600">
        Job posting and applicant management will appear here once the Job
        Posting stage is built.
      </p>
    </Container>
  );
}
