"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guards";
import { createNotification } from "@/lib/notifications";
import type { Prisma } from "@/generated/prisma/client";

async function requireOpenReport(reportId: string) {
  const report = await prisma.report.findUniqueOrThrow({
    where: { id: reportId },
    include: { targetJob: true },
  });
  if (report.status === "RESOLVED" || report.status === "DISMISSED") {
    throw new Error("This report has already been closed out.");
  }
  return report;
}

export async function markUnderReviewAction(reportId: string) {
  await requireAdmin();
  const report = await requireOpenReport(reportId);
  if (report.status !== "OPEN") return;

  await prisma.report.update({ where: { id: reportId }, data: { status: "UNDER_REVIEW" } });
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
}

export type ResolveReportActionState = { error?: string } | null;

export async function resolveReportAction(
  reportId: string,
  _prevState: ResolveReportActionState,
  formData: FormData
): Promise<ResolveReportActionState> {
  const admin = await requireAdmin();
  const report = await requireOpenReport(reportId);

  const note = String(formData.get("note") ?? "").trim();
  const closeJob = formData.get("closeJob") === "on";

  const writes: Prisma.PrismaPromise<unknown>[] = [
    prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED", resolvedById: admin.id, resolvedAt: new Date(), resolutionNote: note || null },
    }),
    prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: "RESOLVE_REPORT",
        targetType: "Report",
        targetId: reportId,
        note: note || null,
      },
    }),
  ];

  if (closeJob && report.targetType === "JOB" && report.targetJobId && report.targetJob?.status !== "CLOSED") {
    writes.push(
      prisma.job.update({ where: { id: report.targetJobId }, data: { status: "CLOSED" } }),
      prisma.adminAction.create({
        data: {
          adminId: admin.id,
          action: "REMOVE_JOB",
          targetType: "Job",
          targetId: report.targetJobId,
          note: `Closed following report ${reportId}.`,
        },
      })
    );
  }

  await prisma.$transaction(writes);

  await createNotification(report.reporterId, "REPORT_UPDATE", "Your report has been reviewed", {
    body: note ? note : "Thanks for the report — our team took action based on our findings.",
    link: "/",
  });

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
  return null;
}

export type DismissReportActionState = { error?: string } | null;

export async function dismissReportAction(
  reportId: string,
  _prevState: DismissReportActionState,
  formData: FormData
): Promise<DismissReportActionState> {
  const admin = await requireAdmin();
  const report = await requireOpenReport(reportId);

  const note = String(formData.get("note") ?? "").trim();

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status: "DISMISSED", resolvedById: admin.id, resolvedAt: new Date(), resolutionNote: note || null },
    }),
    prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: "DISMISS_REPORT",
        targetType: "Report",
        targetId: reportId,
        note: note || null,
      },
    }),
  ]);

  await createNotification(report.reporterId, "REPORT_UPDATE", "Your report was reviewed", {
    body: note ? note : "We looked into your report and didn't find a violation of our policies.",
    link: "/",
  });

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
  return null;
}
