"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guards";
import { createNotification } from "@/lib/notifications";

async function requireJob(jobId: string) {
  return prisma.job.findUniqueOrThrow({ where: { id: jobId } });
}

export async function approveJobAction(jobId: string) {
  const admin = await requireAdmin();
  const job = await requireJob(jobId);
  if (job.status !== "PENDING_REVIEW") return;

  await prisma.$transaction([
    prisma.job.update({
      where: { id: jobId },
      data: { status: "PUBLISHED", publishedAt: new Date(), rejectionReason: null },
    }),
    prisma.adminAction.create({
      data: { adminId: admin.id, action: "APPROVE_JOB", targetType: "Job", targetId: jobId },
    }),
  ]);

  await createNotification(job.postedById, "JOB_APPROVED", `${job.title} is now live`, {
    body: "Your job listing was approved and is now visible to job seekers.",
    link: `/employer/jobs/${jobId}/review`,
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
}

export type RejectJobActionState = { error?: string } | null;

export async function rejectJobAction(
  jobId: string,
  _prevState: RejectJobActionState,
  formData: FormData
): Promise<RejectJobActionState> {
  const admin = await requireAdmin();
  const job = await requireJob(jobId);
  if (job.status !== "PENDING_REVIEW") return { error: "This job is no longer pending review." };

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "Enter a reason for rejecting this job." };

  await prisma.$transaction([
    prisma.job.update({
      where: { id: jobId },
      data: { status: "REJECTED", rejectionReason: reason },
    }),
    prisma.adminAction.create({
      data: { adminId: admin.id, action: "REJECT_JOB", targetType: "Job", targetId: jobId, note: reason },
    }),
  ]);

  await createNotification(job.postedById, "JOB_REJECTED", `${job.title} was rejected`, {
    body: reason,
    link: `/employer/jobs/${jobId}/review`,
  });

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  return null;
}

export async function removeJobAction(jobId: string) {
  const admin = await requireAdmin();
  const job = await requireJob(jobId);
  if (job.status === "CLOSED") return;

  await prisma.$transaction([
    prisma.job.update({ where: { id: jobId }, data: { status: "CLOSED" } }),
    prisma.adminAction.create({
      data: { adminId: admin.id, action: "REMOVE_JOB", targetType: "Job", targetId: jobId, note: "Removed by admin." },
    }),
  ]);

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
}
