import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound, MapPin, Phone, Mail, BadgeCheck, FileText, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireOwnedJob } from "@/lib/employer-guards";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import { applicationStatusTone, nextStatusAction, canReject } from "@/lib/applications";
import { startConversationFromApplicationAction } from "@/lib/messaging-actions";
import { updateApplicationStatusAction, scheduleInterviewAction } from "../actions";
import { InterviewForm } from "@/components/interviews/interview-form";
import { EmployerInterviewCard } from "@/components/interviews/employer-interview-card";

export const metadata: Metadata = { title: "Candidate Profile" };

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-NG", { month: "short", year: "numeric" }).format(date);
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id: jobId, applicationId } = await params;
  await requireOwnedJob(jobId);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      jobSeekerProfile: {
        include: {
          user: { select: { email: true, emailVerified: true } },
          location: true,
          skills: { include: { skill: true } },
          experiences: { orderBy: { startDate: "desc" } },
          educations: { orderBy: { startDate: "desc" } },
        },
      },
      statusEvents: { orderBy: { createdAt: "asc" } },
      interviews: { orderBy: { scheduledAt: "desc" } },
    },
  });

  if (!application || application.jobId !== jobId) notFound();

  if (application.status === "APPLIED") {
    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: "VIEWED", statusEvents: { create: { status: "VIEWED", note: "Viewed by employer." } } },
      include: { statusEvents: { orderBy: { createdAt: "asc" } } },
    });
    application.status = updated.status;
    application.statusEvents = updated.statusEvents;
  }

  const profile = application.jobSeekerProfile;
  const next = nextStatusAction(application.status);
  const rejectable = canReject(application.status);
  const canScheduleInterview = !["REJECTED", "WITHDRAWN", "HIRED"].includes(application.status);
  const scheduleAction = scheduleInterviewAction.bind(null, jobId, application.id);

  return (
    <Container className="max-w-3xl py-10">
      <Link href={`/employer/jobs/${jobId}/applicants`} className="text-sm text-brand-600 hover:underline">
        &larr; Applicants
      </Link>

      <Card className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt={profile.fullName} className="size-16 rounded-full object-cover" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <UserRound className="size-8" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{profile.fullName}</h1>
              <p className="text-sm text-slate-600">{profile.professionalTitle ?? "No title set"}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {profile.location?.city}, {profile.location?.state}
                </span>
                {profile.user.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-accent-700">
                    <BadgeCheck className="size-3.5" />
                    Email verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge tone={applicationStatusTone[application.status]} className="text-sm">
            {titleCase(application.status)}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Mail className="size-4" />
            {profile.user.email}
          </span>
          {profile.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="size-4" />
              {profile.phone}
            </span>
          )}
          {profile.cvUrl && (
            <a
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-600 hover:underline"
            >
              <FileText className="size-4" />
              View CV
            </a>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {next && (
            <form action={updateApplicationStatusAction.bind(null, jobId, application.id, next.next)}>
              <Button type="submit" size="sm">
                {next.label}
              </Button>
            </form>
          )}
          {rejectable && (
            <form action={updateApplicationStatusAction.bind(null, jobId, application.id, "REJECTED")}>
              <Button type="submit" variant="danger" size="sm">
                Reject
              </Button>
            </form>
          )}
          <form action={startConversationFromApplicationAction.bind(null, application.id)}>
            <Button type="submit" variant="ghost" size="sm">
              <MessageCircle className="size-4" />
              Message
            </Button>
          </form>
        </div>
      </Card>

      {profile.aboutMe && (
        <Card className="mt-4">
          <h2 className="font-semibold text-slate-900">About</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{profile.aboutMe}</p>
        </Card>
      )}

      {profile.skills.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-semibold text-slate-900">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <Badge key={s.id} tone="brand">
                {s.skill.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {profile.experiences.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-semibold text-slate-900">Experience</h2>
          <ul className="mt-2 space-y-3">
            {profile.experiences.map((exp) => (
              <li key={exp.id}>
                <p className="text-sm font-medium text-slate-900">
                  {exp.jobTitle} &middot; {exp.company}
                </p>
                <p className="text-xs text-slate-400">
                  {formatMonth(exp.startDate)} &ndash; {exp.isCurrent ? "Present" : exp.endDate ? formatMonth(exp.endDate) : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {profile.educations.length > 0 && (
        <Card className="mt-4">
          <h2 className="font-semibold text-slate-900">Education</h2>
          <ul className="mt-2 space-y-2">
            {profile.educations.map((edu) => (
              <li key={edu.id} className="text-sm text-slate-700">
                {edu.qualification}
                {edu.field ? `, ${edu.field}` : ""} &middot; {edu.institution}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-4">
        <h2 className="font-semibold text-slate-900">Interviews</h2>
        {application.interviews.length > 0 && (
          <div className="mt-3 space-y-3">
            {application.interviews.map((interview) => (
              <EmployerInterviewCard
                key={interview.id}
                jobId={jobId}
                interview={{
                  id: interview.id,
                  type: interview.type,
                  scheduledAt: interview.scheduledAt.toISOString(),
                  locationInfo: interview.locationInfo,
                  notes: interview.notes,
                  status: interview.status,
                  candidateResponseNote: interview.candidateResponseNote,
                }}
              />
            ))}
          </div>
        )}
        {canScheduleInterview && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Schedule an interview</p>
            <InterviewForm action={scheduleAction} submitLabel="Schedule interview" />
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold text-slate-900">Application timeline</h2>
        <ol className="mt-3 space-y-3">
          {application.statusEvents.map((event) => (
            <li key={event.id} className="text-sm">
              <span className="font-medium text-slate-900">{titleCase(event.status)}</span>{" "}
              <span className="text-slate-400">&middot; {formatRelativeDate(event.createdAt)}</span>
            </li>
          ))}
        </ol>
      </Card>
    </Container>
  );
}
