"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea, Label, FieldError } from "@/components/ui/input";
import { rejectVerificationAction, type RejectActionState } from "../actions";

export function RejectVerificationForm({ verificationId }: { verificationId: string }) {
  const action = rejectVerificationAction.bind(null, verificationId);
  const [state, formAction, pending] = useActionState<RejectActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="reason">Rejection reason (shown to the employer)</Label>
      <Textarea id="reason" name="reason" className="min-h-20" required />
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Rejecting..." : "Reject verification"}
      </Button>
    </form>
  );
}
