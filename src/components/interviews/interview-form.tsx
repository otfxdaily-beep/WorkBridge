"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import type { InterviewActionState } from "@/app/employer/jobs/[id]/applicants/actions";

type InterviewFormValues = {
  type: string;
  date: string;
  time: string;
  locationInfo: string;
  notes: string;
};

export function InterviewForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (prevState: InterviewActionState, formData: FormData) => Promise<InterviewActionState>;
  initialValues?: Partial<InterviewFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<InterviewActionState, FormData>(action, null);
  const v = initialValues ?? {};

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="type" className="text-xs">Type</Label>
          <Select id="type" name="type" defaultValue={v.type ?? "VIDEO"}>
            <option value="IN_PERSON">In person</option>
            <option value="PHONE">Phone</option>
            <option value="VIDEO">Video</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="date" className="text-xs">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={v.date} required />
          {state?.fieldErrors?.date && <FieldError>{state.fieldErrors.date[0]}</FieldError>}
        </div>
        <div>
          <Label htmlFor="time" className="text-xs">Time</Label>
          <Input id="time" name="time" type="time" defaultValue={v.time} required />
          {state?.fieldErrors?.time && <FieldError>{state.fieldErrors.time[0]}</FieldError>}
        </div>
      </div>

      <div>
        <Label htmlFor="locationInfo" className="text-xs">Location / meeting link</Label>
        <Input
          id="locationInfo"
          name="locationInfo"
          defaultValue={v.locationInfo}
          placeholder="e.g. Google Meet link, or office address"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-xs">Notes for the candidate</Label>
        <Textarea id="notes" name="notes" defaultValue={v.notes} className="min-h-20" />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
