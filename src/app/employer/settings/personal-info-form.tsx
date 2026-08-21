"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { updateEmployerPersonalInfoAction, type ActionState } from "./actions";

export function PersonalInfoForm({
  fullName,
  jobTitle,
  phone,
  email,
}: {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateEmployerPersonalInfoAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Personal information</h2>
      <form action={formAction} className="mt-4 space-y-4">
        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        {state?.success && <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{state.success}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={fullName} required />
            {state?.fieldErrors?.fullName && <FieldError>{state.fieldErrors.fullName[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div>
            <Label htmlFor="jobTitle">Your role at the company</Label>
            <Input id="jobTitle" name="jobTitle" defaultValue={jobTitle} placeholder="e.g. HR Manager" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={phone} placeholder="+234..." />
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save personal information"}
        </Button>
      </form>
    </Card>
  );
}
