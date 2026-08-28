"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnedJob } from "@/lib/employer-guards";
import type { ApplicationStatus } from "@/generated/prisma/client";

const STATUS_NOTES: Record<ApplicationStatus, string> = {
  APPLIED: "Applied.",
  VIEWED: "Viewed by employer.",
  SHORTLISTED: "Shortlisted by employer.",
  INTERVIEW: "Moved to interview stage.",
  OFFER: "Offer extended.",
  HIRED: "Marked as hired.",
  REJECTED: "Application rejected.",
  WITHDRAWN: "Withdrawn by applicant.",
};

async function requireOwnedApplication(jobId: string, applicationId: string) {
  await requireOwnedJob(jobId);
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.jobId !== jobId) throw new Error("Application does not belong to this job.");
  return application;
}

export async function markApplicationViewedAction(jobId: string, applicationId: string) {
  const application = await requireOwnedApplication(jobId, applicationId);
  if (application.status !== "APPLIED") return;

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "VIEWED", statusEvents: { create: { status: "VIEWED", note: STATUS_NOTES.VIEWED } } },
  });

  revalidatePath(`/employer/jobs/${jobId}/applicants`);
}

export async function updateApplicationStatusAction(jobId: string, applicationId: string, status: ApplicationStatus) {
  await requireOwnedApplication(jobId, applicationId);

  await prisma.application.update({
    where: { id: applicationId },
    data: { status, statusEvents: { create: { status, note: STATUS_NOTES[status] } } },
  });

  revalidatePath(`/employer/jobs/${jobId}/applicants`);
  revalidatePath(`/employer/jobs/${jobId}/applicants/${applicationId}`);
}
