import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Employer Dashboard" };

export default async function EmployerDashboardPage() {
  const user = await requireRole("EMPLOYER");
  const profile = await prisma.employerProfile.findUnique({ where: { userId: user.id } });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        Welcome, {profile?.fullName.split(" ")[0]}
      </h1>
      <p className="mt-2 max-w-lg text-slate-600">
        Your employer account is set up. Company profile creation, job
        posting and applicant management will appear here once the Employer
        Onboarding and Job Posting stages are built.
      </p>
    </Container>
  );
}
