"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { resolveReportAction, type ResolveReportActionState } from "../actions";

export function ResolveReportForm({ reportId, isJobReport }: { reportId: string; isJobReport: boolean }) {
  const action = resolveReportAction.bind(null, reportId);
  const [state, formAction, pending] = useActionState<ResolveReportActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-2 rounded-lg bg-accent-50 p-3">
      <Label htmlFor="note">Resolution note (shown to the reporter)</Label>
      <Textarea id="note" name="note" className="min-h-16" />
      {isJobReport && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="closeJob" className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
          Also close this job listing
        </label>
      )}
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Resolving..." : "Resolve report"}
      </Button>
    </form>
  );
}
