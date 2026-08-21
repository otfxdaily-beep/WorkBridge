import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { calculateProfileCompletion } from "@/lib/profile-completion";

export const metadata: Metadata = { title: "Dashboard" };

export default async function JobSeekerDashboardPage() {
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: { skills: true, experiences: true, educations: true, preference: true },
  });

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

      <p className="mt-6 max-w-lg text-slate-600">
        Job search, applications, saved jobs and recommended matches will
        appear here once the Job Search stage is built.
      </p>
    </Container>
  );
}
