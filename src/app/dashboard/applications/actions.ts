"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

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
