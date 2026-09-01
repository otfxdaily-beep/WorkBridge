"use client";

import { useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { interviewStatusTone, interviewTypeLabel, formatInterviewDateTime, utcToNigeriaDateInput } from "@/lib/interviews";
import { InterviewForm } from "./interview-form";
import {
  rescheduleInterviewAction,
  cancelInterviewAction,
  markInterviewCompletedAction,
} from "@/app/employer/jobs/[id]/applicants/actions";
import type { InterviewStatus, InterviewType } from "@/generated/prisma/client";

export type EmployerInterviewData = {
  id: string;
  type: InterviewType;
  scheduledAt: string;
  locationInfo: string | null;
  notes: string | null;
  status: InterviewStatus;
  candidateResponseNote: string | null;
};

const ACTIVE_STATUSES: InterviewStatus[] = ["PROPOSED", "ACCEPTED", "RESCHEDULE_REQUESTED"];

export function EmployerInterviewCard({ jobId, interview }: { jobId: string; interview: EmployerInterviewData }) {
  const [rescheduling, setRescheduling] = useState(false);
  const scheduledDate = new Date(interview.scheduledAt);
  const isActive = ACTIVE_STATUSES.includes(interview.status);

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
          Candidate: {interview.candidateResponseNote}
        </p>
      )}

      {isActive && !rescheduling && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setRescheduling(true)}>
            {interview.status === "RESCHEDULE_REQUESTED" ? "Propose new time" : "Reschedule"}
          </Button>
          {interview.status === "ACCEPTED" && (
            <form action={markInterviewCompletedAction.bind(null, jobId, interview.id)}>
              <Button type="submit" size="sm">
                Mark completed
              </Button>
            </form>
          )}
          <form action={cancelInterviewAction.bind(null, jobId, interview.id)}>
            <Button type="submit" variant="danger" size="sm">
              Cancel
            </Button>
          </form>
        </div>
      )}

      {rescheduling && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <InterviewForm
            action={rescheduleInterviewAction.bind(null, jobId, interview.id)}
            initialValues={{
              type: interview.type,
              ...utcToNigeriaDateInput(scheduledDate),
              locationInfo: interview.locationInfo ?? "",
              notes: interview.notes ?? "",
            }}
            submitLabel="Save new time"
          />
          <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setRescheduling(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
