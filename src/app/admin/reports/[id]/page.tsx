import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import { markUnderReviewAction } from "../actions";
import { ResolveReportForm } from "./resolve-form";
import { DismissReportForm } from "./dismiss-form";

export const metadata: Metadata = { title: "Review Report" };

export default async function AdminReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: true,
      targetJob: { include: { company: true } },
      targetUser: true,
      targetConversation: true,
      targetMessage: true,
    },
  });

  if (!report) notFound();

  const isActionable = report.status === "OPEN" || report.status === "UNDER_REVIEW";

  return (
    <Container className="max-w-2xl py-10">
      <Link href="/admin/reports" className="text-sm text-brand-600 hover:underline">
        &larr; Reports
      </Link>

      <Card className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{titleCase(report.reason)}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Reported by {report.reporter.email} &middot; {formatRelativeDate(report.createdAt)}
            </p>
          </div>
          <Badge
            tone={
              report.status === "OPEN"
                ? "warning"
                : report.status === "RESOLVED"
                  ? "success"
                  : report.status === "UNDER_REVIEW"
                    ? "neutral"
                    : "neutral"
            }
          >
            {titleCase(report.status)}
          </Badge>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Reported {titleCase(report.targetType)}</p>
          {report.targetType === "JOB" &&
            (report.targetJob ? (
              <Link href={`/jobs/${report.targetJob.slug}`} className="mt-1 inline-block text-brand-600 hover:underline">
                {report.targetJob.title} &middot; {report.targetJob.company.name}
              </Link>
            ) : (
              <p className="mt-1 text-slate-400">This job has since been deleted.</p>
            ))}
          {report.targetType === "USER" &&
            (report.targetUser ? (
              <p className="mt-1">{report.targetUser.email}</p>
            ) : (
              <p className="mt-1 text-slate-400">This user has since been deleted.</p>
            ))}
          {report.targetType === "MESSAGE" &&
            (report.targetConversation ? (
              <p className="mt-1 text-slate-500">Reported message in a conversation between two users.</p>
            ) : (
              <p className="mt-1 text-slate-400">This message has since been deleted.</p>
            ))}
        </div>

        {report.description && (
          <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Details from reporter</p>
            <p className="mt-1 whitespace-pre-wrap">{report.description}</p>
          </div>
        )}

        {!isActionable && (
          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <p className="font-medium text-slate-900">{titleCase(report.status)}</p>
            {report.resolutionNote && <p className="mt-1">{report.resolutionNote}</p>}
          </div>
        )}

        {isActionable && (
          <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
            {report.status === "OPEN" && (
              <form action={markUnderReviewAction.bind(null, report.id)}>
                <Button type="submit" variant="secondary" size="sm">
                  Mark as under review
                </Button>
              </form>
            )}
            <ResolveReportForm reportId={report.id} isJobReport={report.targetType === "JOB" && Boolean(report.targetJob)} />
            <DismissReportForm reportId={report.id} />
          </div>
        )}
      </Card>
    </Container>
  );
}
