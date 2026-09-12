"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guards";
import { createNotification } from "@/lib/notifications";

async function requirePendingVerification(verificationId: string) {
  const verification = await prisma.verification.findUniqueOrThrow({
    where: { id: verificationId },
    include: { company: { include: { employerProfiles: true } } },
  });
  if (verification.status !== "PENDING") {
    throw new Error("This verification request has already been reviewed.");
  }
  return verification;
}

export async function approveVerificationAction(verificationId: string) {
  const admin = await requireAdmin();
  const verification = await requirePendingVerification(verificationId);

  await prisma.$transaction([
    prisma.verification.update({
      where: { id: verificationId },
      data: { status: "VERIFIED", reviewedById: admin.id, reviewedAt: new Date() },
    }),
    prisma.company.update({
      where: { id: verification.companyId },
      data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
    }),
    prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: "VERIFY_EMPLOYER",
        targetType: "Company",
        targetId: verification.companyId,
      },
    }),
  ]);

  for (const employer of verification.company.employerProfiles) {
    await createNotification(employer.userId, "VERIFICATION_APPROVED", `${verification.company.name} is now verified`, {
      body: "Your company has been approved as a Verified Employer.",
      link: "/employer/company",
    });
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${verificationId}`);
}

export type RejectActionState = { error?: string } | null;

export async function rejectVerificationAction(
  verificationId: string,
  _prevState: RejectActionState,
  formData: FormData
): Promise<RejectActionState> {
  const admin = await requireAdmin();
  const verification = await requirePendingVerification(verificationId);

  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return { error: "Enter a reason for rejecting this request." };

  await prisma.$transaction([
    prisma.verification.update({
      where: { id: verificationId },
      data: { status: "REJECTED", reviewedById: admin.id, reviewedAt: new Date(), rejectionReason: reason },
    }),
    prisma.company.update({
      where: { id: verification.companyId },
      data: { verificationStatus: "REJECTED" },
    }),
    prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: "REJECT_VERIFICATION",
        targetType: "Company",
        targetId: verification.companyId,
        note: reason,
      },
    }),
  ]);

  for (const employer of verification.company.employerProfiles) {
    await createNotification(
      employer.userId,
      "VERIFICATION_REJECTED",
      `Verification request for ${verification.company.name} was rejected`,
      { body: reason, link: "/employer/company" }
    );
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${verificationId}`);
  return null;
}
