import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export async function requireCompany() {
  const user = await requireRole("EMPLOYER");
  const employerProfile = await prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });
  if (!employerProfile.companyId) redirect("/employer/company");
  return { user, companyId: employerProfile.companyId };
}

export async function requireOwnedJob(jobId: string) {
  const { companyId } = await requireCompany();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  if (job.companyId !== companyId) redirect("/employer/jobs");
  return job;
}
