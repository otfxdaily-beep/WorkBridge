import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, MinusCircle, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatSalaryRange, formatRelativeDate, titleCase } from "@/lib/utils";
import { applicationStatusTone } from "@/lib/applications";
import { startConversationFromApplicationAction } from "@/lib/messaging-actions";
import { withdrawApplicationAction } from "../actions";

export const metadata: Metadata = { title: "Application Status" };

const TERMINAL_STATUSES = ["HIRED", "REJECTED", "WITHDRAWN"];

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { include: { company: true, location: true } },
      statusEvents: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!application) notFound();
  if (application.jobSeekerProfileId !== profile.id) notFound();

  const canWithdraw = !TERMINAL_STATUSES.includes(application.status);

  return (
    <Container className="max-w-2xl py-10">
      <Link href="/dashboard/applications" className="text-sm text-brand-600 hover:underline">
        &larr; All applications
      </Link>

      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{application.job.title}</h1>
            <p className="mt-0.5 text-sm text-slate-600">
              {application.job.company.name} &middot; {application.job.location.city}, {application.job.location.state}
            </p>
          </div>
          <Badge tone={applicationStatusTone[application.status]} className="text-sm">
            {titleCase(application.status)}
          </Badge>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {formatSalaryRange(application.job.salaryMin, application.job.salaryMax, application.job.salaryFrequency)}
        </p>

        <form action={startConversationFromApplicationAction.bind(null, application.id)} className="mt-4">
          <Button type="submit" variant="secondary" size="sm">
            <MessageCircle className="size-4" />
            Message Employer
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h2 className="font-semibold text-slate-900">Status timeline</h2>
          <ol className="mt-4 space-y-6">
            {application.statusEvents.map((event, i) => {
              const isLast = i === application.statusEvents.length - 1;
              const Icon =
                event.status === "REJECTED" ? XCircle : event.status === "WITHDRAWN" ? MinusCircle : CheckCircle2;
              const iconColor =
                event.status === "REJECTED"
                  ? "text-red-500"
                  : event.status === "WITHDRAWN"
                    ? "text-slate-400"
                    : "text-accent-600";

              return (
                <li key={event.id} className="relative flex gap-3 pl-1">
                  {!isLast && (
                    <span className="absolute left-[13px] top-6 h-full w-px bg-slate-200" aria-hidden="true" />
                  )}
                  <Icon className={`size-5 shrink-0 ${iconColor}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{titleCase(event.status)}</p>
                    {event.note && <p className="text-sm text-slate-600">{event.note}</p>}
                    <p className="text-xs text-slate-400">{formatRelativeDate(event.createdAt)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {canWithdraw && (
          <form action={withdrawApplicationAction.bind(null, application.id)} className="mt-6 border-t border-slate-100 pt-6">
            <Button type="submit" variant="danger" size="sm">
              Withdraw application
            </Button>
          </form>
        )}
      </Card>
    </Container>
  );
}
