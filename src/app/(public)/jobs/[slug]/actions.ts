"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateMatch, buildCandidateMatchInput, buildJobMatchInput } from "@/lib/matching";
import { createNotification } from "@/lib/notifications";
import { jobReportSchema } from "@/lib/validation/report";
import type { ReportReason } from "@/generated/prisma/client";

export async function toggleSaveJobAction(jobId: string, slug: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/jobs/${slug}`);
  if (user.role !== "JOB_SEEKER") return;

  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { userId: user.id } });
  const existing = await prisma.savedJob.findUnique({
    where: { jobSeekerProfileId_jobId: { jobSeekerProfileId: profile.id, jobId } },
  });

  if (existing) {
    await prisma.savedJob.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedJob.create({ data: { jobSeekerProfileId: profile.id, jobId } });
  }

  revalidatePath(`/jobs/${slug}`);
}

export async function applyToJobAction(jobId: string, slug: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/jobs/${slug}`);
  if (user.role !== "JOB_SEEKER") return;

  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: { skills: { include: { skill: true } }, location: true, preference: { include: { location: true } } },
  });
  if (!profile.cvUrl) redirect(`/dashboard/profile?needsCv=1`);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { skills: { include: { skill: true } }, location: true },
  });
  if (!job || job.status !== "PUBLISHED") redirect(`/jobs/${slug}`);
  if (job.deadline && job.deadline < new Date()) redirect(`/jobs/${slug}`);

  const existing = await prisma.application.findUnique({
    where: { jobId_jobSeekerProfileId: { jobId, jobSeekerProfileId: profile.id } },
  });
  if (existing) redirect(`/dashboard/applications/${existing.id}`);

  const { score, explanation } = calculateMatch(buildCandidateMatchInput(profile), buildJobMatchInput(job));

  const application = await prisma.application.create({
    data: {
      jobId,
      jobSeekerProfileId: profile.id,
      status: "APPLIED",
      matchScore: score,
      matchExplanation: explanation,
      statusEvents: { create: { status: "APPLIED", note: "Application submitted." } },
    },
  });

  await createNotification(user.id, "APPLICATION_SUBMITTED", `You applied to ${job.title}`, {
    body: `Your application to ${job.title} was submitted successfully.`,
    link: `/dashboard/applications/${application.id}`,
  });
  await createNotification(job.postedById, "NEW_APPLICATION", `New applicant for ${job.title}`, {
    body: `${profile.fullName} applied to ${job.title}.`,
    link: `/employer/jobs/${job.id}/applicants/${application.id}`,
  });

  redirect(`/dashboard/applications/${application.id}`);
}

export type ReportJobActionState = { error?: string; success?: string } | null;

export async function reportJobAction(
  jobId: string,
  _prevState: ReportJobActionState,
  formData: FormData
): Promise<ReportJobActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = jobReportSchema.safeParse({
    reason: formData.get("reason"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: "Choose a reason." };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return { error: "This job no longer exists." };

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType: "JOB",
      targetJobId: jobId,
      reason: parsed.data.reason as ReportReason,
      description: parsed.data.description || null,
    },
  });

  return { success: "Report submitted. Our team will review it." };
}
