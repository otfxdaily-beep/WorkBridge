"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { interviewResponseSchema } from "@/lib/validation/interview";
import type { InterviewStatus } from "@/generated/prisma/client";

const TERMINAL_STATUSES = ["HIRED", "REJECTED", "WITHDRAWN"];

export async function withdrawApplicationAction(applicationId: string) {
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.jobSeekerProfileId !== profile.id) return;
  if (TERMINAL_STATUSES.includes(application.status)) return;

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "WITHDRAWN",
      statusEvents: { create: { status: "WITHDRAWN", note: "Withdrawn by applicant." } },
    },
  });

  revalidatePath(`/dashboard/applications/${applicationId}`);
  revalidatePath("/dashboard/applications");
}

export type InterviewResponseState = { error?: string } | null;

async function requireOwnedInterview(interviewId: string) {
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const interview = await prisma.interview.findUniqueOrThrow({
    where: { id: interviewId },
    include: { application: true },
  });
  if (interview.application.jobSeekerProfileId !== profile.id) {
    throw new Error("Interview does not belong to this applicant.");
  }
  return interview;
}

export async function respondToInterviewAction(
  interviewId: string,
  status: InterviewStatus,
  _prevState: InterviewResponseState,
  formData: FormData
): Promise<InterviewResponseState> {
  const interview = await requireOwnedInterview(interviewId);
  if (interview.status !== "PROPOSED") return { error: "This interview has already been responded to." };

  const parsed = interviewResponseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check your response." };

  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      status,
      candidateResponseNote: parsed.data.note || null,
      respondedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/applications/${interview.applicationId}`);
  revalidatePath(`/employer/jobs/${interview.application.jobId}/applicants/${interview.applicationId}`);
  return null;
}
