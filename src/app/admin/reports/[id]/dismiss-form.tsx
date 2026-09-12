"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { dismissReportAction, type DismissReportActionState } from "../actions";

export function DismissReportForm({ reportId }: { reportId: string }) {
  const action = dismissReportAction.bind(null, reportId);
  const [state, formAction, pending] = useActionState<DismissReportActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="note">Dismissal note (optional, shown to the reporter)</Label>
      <Textarea id="note" name="note" className="min-h-16" />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <Button type="submit" variant="ghost" disabled={pending}>
        {pending ? "Dismissing..." : "Dismiss report"}
      </Button>
    </form>
  );
}
