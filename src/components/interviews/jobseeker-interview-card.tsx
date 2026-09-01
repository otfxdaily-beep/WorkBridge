"use client";

import { useActionState, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { interviewStatusTone, interviewTypeLabel, formatInterviewDateTime } from "@/lib/interviews";
import { respondToInterviewAction, type InterviewResponseState } from "@/app/dashboard/applications/actions";
import type { InterviewStatus, InterviewType } from "@/generated/prisma/client";

export type JobSeekerInterviewData = {
  id: string;
  type: InterviewType;
  scheduledAt: string;
  locationInfo: string | null;
  notes: string | null;
  status: InterviewStatus;
  candidateResponseNote: string | null;
};

function ResponseForm({ interviewId, status, label, variant }: {
  interviewId: string;
  status: InterviewStatus;
  label: string;
  variant: "primary" | "secondary" | "danger";
}) {
  const action = respondToInterviewAction.bind(null, interviewId, status);
  const [state, formAction, pending] = useActionState<InterviewResponseState, FormData>(action, null);
  const [open, setOpen] = useState(false);
  const needsNote = status !== "ACCEPTED";

  if (!open) {
    return (
      <Button type="button" variant={variant} size="sm" onClick={() => (needsNote ? setOpen(true) : formAction(new FormData()))}>
        {label}
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-2 w-full space-y-2">
      <Label htmlFor={`note-${interviewId}-${status}`} className="text-xs">
        {status === "DECLINED" ? "Reason (optional)" : "Preferred time (optional)"}
      </Label>
      <Textarea id={`note-${interviewId}-${status}`} name="note" className="min-h-16" />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant={variant} size="sm" disabled={pending}>
          {pending ? "Sending..." : `Confirm ${label.toLowerCase()}`}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function JobSeekerInterviewCard({ interview }: { interview: JobSeekerInterviewData }) {
  const scheduledDate = new Date(interview.scheduledAt);

  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900">
          <Calendar className="size-4 text-slate-400" />
          {formatInterviewDateTime(scheduledDate)}
        </span>
        <Badge tone={interviewStatusTone[interview.status]}>{interview.status.replace("_", " ")}</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-600">{interviewTypeLabel[interview.type]}</p>
      {interview.locationInfo && (
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="size-3.5" />
          {interview.locationInfo}
        </p>
      )}
      {interview.notes && <p className="mt-1 text-sm text-slate-500">{interview.notes}</p>}
      {interview.candidateResponseNote && (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Your note: {interview.candidateResponseNote}
        </p>
      )}

      {interview.status === "PROPOSED" && (
        <div className="mt-3 flex flex-wrap items-start gap-2">
          <ResponseForm interviewId={interview.id} status="ACCEPTED" label="Accept" variant="primary" />
          <ResponseForm interviewId={interview.id} status="RESCHEDULE_REQUESTED" label="Request another time" variant="secondary" />
          <ResponseForm interviewId={interview.id} status="DECLINED" label="Decline" variant="danger" />
        </div>
      )}
    </div>
  );
}
