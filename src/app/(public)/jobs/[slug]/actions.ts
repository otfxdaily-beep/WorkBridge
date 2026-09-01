"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateMatch, buildCandidateMatchInput, buildJobMatchInput } from "@/lib/matching";

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

  redirect(`/dashboard/applications/${application.id}`);
}
