import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [totalUsers, jobSeekers, employers, verifiedCompanies, pendingVerifications, activeJobs, applications] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "JOB_SEEKER" } }),
      prisma.user.count({ where: { role: "EMPLOYER" } }),
      prisma.company.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.verification.count({ where: { status: "PENDING" } }),
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.application.count(),
    ]);

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
      <p className="mt-2 max-w-lg text-slate-600">
        Platform overview. User management, job moderation and report
        handling will appear here as the remaining admin stages are built.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-2xl font-semibold text-slate-900">{totalUsers}</p>
          <p className="text-sm text-slate-500">Total users</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-slate-900">{jobSeekers}</p>
          <p className="text-sm text-slate-500">Job seekers</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-slate-900">{employers}</p>
          <p className="text-sm text-slate-500">Employers</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-slate-900">{verifiedCompanies}</p>
          <p className="text-sm text-slate-500">Verified employers</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-slate-900">{activeJobs}</p>
          <p className="text-sm text-slate-500">Active jobs</p>
        </Card>
        <Card>
          <p className="text-2xl font-semibold text-slate-900">{applications}</p>
          <p className="text-sm text-slate-500">Applications</p>
        </Card>
      </div>

      {pendingVerifications > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-amber-900">
              {pendingVerifications} employer verification{pendingVerifications === 1 ? "" : "s"} awaiting review
            </p>
            <p className="text-sm text-amber-700">Review company details and approve or reject each request.</p>
          </div>
          <ButtonLink href="/admin/verifications" size="sm" className="shrink-0">
            Review verifications
          </ButtonLink>
        </div>
      )}
    </Container>
  );
}
