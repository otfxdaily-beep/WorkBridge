"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea, Label, FieldError } from "@/components/ui/input";
import { rejectJobAction, type RejectJobActionState } from "../actions";

export function RejectJobForm({ jobId }: { jobId: string }) {
  const action = rejectJobAction.bind(null, jobId);
  const [state, formAction, pending] = useActionState<RejectJobActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="reason">Rejection reason (shown to the employer)</Label>
      <Textarea id="reason" name="reason" className="min-h-20" required />
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Rejecting..." : "Reject job"}
      </Button>
    </form>
  );
}
