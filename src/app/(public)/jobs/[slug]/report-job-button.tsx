"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label } from "@/components/ui/input";
import { reportJobAction, type ReportJobActionState } from "./actions";

export function ReportJobButton({ jobId, isLoggedIn }: { jobId: string; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const action = reportJobAction.bind(null, jobId);
  const [state, formAction, pending] = useActionState<ReportJobActionState, FormData>(action, null);

  if (!isLoggedIn) {
    return (
      <Button variant="ghost" className="w-full sm:w-auto" disabled title="Log in to report a job">
        <Flag className="size-4" />
        Report Job
      </Button>
    );
  }

  return (
    <div className="w-full sm:w-auto">
      <Button
        type="button"
        variant="ghost"
        className="w-full sm:w-auto"
        onClick={() => setOpen((v) => !v)}
        disabled={Boolean(state?.success)}
      >
        <Flag className="size-4" />
        {state?.success ? "Reported" : "Report Job"}
      </Button>

      {open && !state?.success && (
        <form action={formAction} className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3 sm:w-80">
          <div>
            <Label htmlFor="reason" className="text-xs">
              Reason
            </Label>
            <Select id="reason" name="reason" required>
              <option value="">Select a reason</option>
              <option value="FAKE_JOB">Fake job posting</option>
              <option value="SCAM">Scam</option>
              <option value="MONEY_REQUEST">Requesting money</option>
              <option value="MISLEADING_SALARY">Misleading salary</option>
              <option value="DISCRIMINATION">Discrimination</option>
              <option value="SUSPICIOUS_BEHAVIOR">Suspicious behavior</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="description" className="text-xs">
              Details (optional)
            </Label>
            <Textarea id="description" name="description" className="min-h-16" />
          </div>
          {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
          <Button type="submit" variant="danger" size="sm" disabled={pending}>
            {pending ? "Submitting..." : "Submit report"}
          </Button>
        </form>
      )}
      {state?.success && <p className="mt-1.5 text-xs text-accent-700">{state.success}</p>}
    </div>
  );
}
