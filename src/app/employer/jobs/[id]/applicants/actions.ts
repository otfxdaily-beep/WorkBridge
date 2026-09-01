"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompany, requireOwnedJob } from "@/lib/employer-guards";
import { scheduleInterviewSchema } from "@/lib/validation/interview";
import { nigeriaDateTimeToUTC } from "@/lib/interviews";
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

export type InterviewActionState = { error?: string; fieldErrors?: Record<string, string[]> } | null;

export async function scheduleInterviewAction(
  jobId: string,
  applicationId: string,
  _prevState: InterviewActionState,
  formData: FormData
): Promise<InterviewActionState> {
  const { user } = await requireCompany();
  await requireOwnedApplication(jobId, applicationId);

  const parsed = scheduleInterviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { type, date, time, locationInfo, notes } = parsed.data;
  const scheduledAt = nigeriaDateTimeToUTC(date, time);
  if (Number.isNaN(scheduledAt.getTime())) return { error: "Enter a valid date and time." };

  await prisma.interview.create({
    data: {
      applicationId,
      scheduledById: user.id,
      type,
      scheduledAt,
      locationInfo: locationInfo || null,
      notes: notes || null,
      status: "PROPOSED",
    },
  });

  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.status === "SHORTLISTED" || application.status === "APPLIED" || application.status === "VIEWED") {
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "INTERVIEW",
        statusEvents: { create: { status: "INTERVIEW", note: "Interview scheduled." } },
      },
    });
  }

  revalidatePath(`/employer/jobs/${jobId}/applicants/${applicationId}`);
  revalidatePath(`/dashboard/applications/${applicationId}`);
  return null;
}

async function requireOwnedInterview(jobId: string, interviewId: string) {
  await requireOwnedJob(jobId);
  const interview = await prisma.interview.findUniqueOrThrow({
    where: { id: interviewId },
    include: { application: true },
  });
  if (interview.application.jobId !== jobId) throw new Error("Interview does not belong to this job.");
  return interview;
}

export async function rescheduleInterviewAction(
  jobId: string,
  interviewId: string,
  _prevState: InterviewActionState,
  formData: FormData
): Promise<InterviewActionState> {
  const interview = await requireOwnedInterview(jobId, interviewId);

  const parsed = scheduleInterviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { type, date, time, locationInfo, notes } = parsed.data;
  const scheduledAt = nigeriaDateTimeToUTC(date, time);
  if (Number.isNaN(scheduledAt.getTime())) return { error: "Enter a valid date and time." };

  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      type,
      scheduledAt,
      locationInfo: locationInfo || null,
      notes: notes || null,
      status: "PROPOSED",
      candidateResponseNote: null,
      respondedAt: null,
    },
  });

  revalidatePath(`/employer/jobs/${jobId}/applicants/${interview.applicationId}`);
  revalidatePath(`/dashboard/applications/${interview.applicationId}`);
  return null;
}

export async function cancelInterviewAction(jobId: string, interviewId: string) {
  const interview = await requireOwnedInterview(jobId, interviewId);
  await prisma.interview.update({ where: { id: interviewId }, data: { status: "CANCELLED" } });
  revalidatePath(`/employer/jobs/${jobId}/applicants/${interview.applicationId}`);
  revalidatePath(`/dashboard/applications/${interview.applicationId}`);
}

export async function markInterviewCompletedAction(jobId: string, interviewId: string) {
  const interview = await requireOwnedInterview(jobId, interviewId);
  await prisma.interview.update({ where: { id: interviewId }, data: { status: "COMPLETED" } });
  revalidatePath(`/employer/jobs/${jobId}/applicants/${interview.applicationId}`);
  revalidatePath(`/dashboard/applications/${interview.applicationId}`);
}
