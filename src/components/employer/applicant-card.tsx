import { UserRound, MapPin, BadgeCheck, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import { applicationStatusTone, nextStatusAction, canReject } from "@/lib/applications";
import { updateApplicationStatusAction } from "@/app/employer/jobs/[id]/applicants/actions";
import { startConversationFromApplicationAction } from "@/lib/messaging-actions";
import type { ApplicationStatus } from "@/generated/prisma/client";

export type ApplicantCardData = {
  applicationId: string;
  status: ApplicationStatus;
  appliedAt: string;
  fullName: string;
  photoUrl: string | null;
  professionalTitle: string | null;
  city: string;
  state: string;
  yearsOfExperience: number | null;
  skills: string[];
  emailVerified: boolean;
  matchScore: number | null;
};

export function ApplicantCard({ jobId, applicant }: { jobId: string; applicant: ApplicantCardData }) {
  const next = nextStatusAction(applicant.status);
  const rejectable = canReject(applicant.status);

  return (
    <Card>
      <div className="flex items-start gap-3">
        {applicant.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={applicant.photoUrl} alt={applicant.fullName} className="size-12 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <UserRound className="size-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{applicant.fullName}</span>
            <Badge tone={applicationStatusTone[applicant.status]}>{titleCase(applicant.status)}</Badge>
            {applicant.matchScore != null && <Badge tone="brand">{applicant.matchScore}% Match</Badge>}
          </div>
          <p className="text-sm text-slate-600">{applicant.professionalTitle ?? "No title set"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {applicant.city}, {applicant.state}
            </span>
            {applicant.yearsOfExperience != null && <span>{applicant.yearsOfExperience} yrs experience</span>}
            {applicant.emailVerified && (
              <span className="inline-flex items-center gap-1 text-accent-700">
                <BadgeCheck className="size-3.5" />
                Email verified
              </span>
            )}
            <span>Applied {formatRelativeDate(applicant.appliedAt)}</span>
          </div>
        </div>
      </div>

      {applicant.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {applicant.skills.slice(0, 6).map((skill) => (
            <Badge key={skill} tone="neutral">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <ButtonLink href={`/employer/jobs/${jobId}/applicants/${applicant.applicationId}`} variant="secondary" size="sm">
          View Profile
        </ButtonLink>
        {next && (
          <form action={updateApplicationStatusAction.bind(null, jobId, applicant.applicationId, next.next)}>
            <Button type="submit" size="sm">
              {next.label}
            </Button>
          </form>
        )}
        {rejectable && (
          <form action={updateApplicationStatusAction.bind(null, jobId, applicant.applicationId, "REJECTED")}>
            <Button type="submit" variant="danger" size="sm">
              Reject
            </Button>
          </form>
        )}
        <form action={startConversationFromApplicationAction.bind(null, applicant.applicationId)}>
          <Button type="submit" variant="ghost" size="sm">
            <MessageCircle className="size-4" />
            Message
          </Button>
        </form>
      </div>
    </Card>
  );
}
