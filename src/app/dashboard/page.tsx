import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

export default async function JobSeekerDashboardPage() {
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        {greeting}, {profile?.fullName.split(" ")[0]}
      </h1>
      <p className="mt-2 max-w-lg text-slate-600">
        Your account is set up. Job search, applications, saved jobs and
        recommended matches will appear here once the Job Seeker Onboarding
        and Job Search stages are built.
      </p>
    </Container>
  );
}
