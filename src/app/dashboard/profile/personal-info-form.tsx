"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { updatePersonalInfoAction, type ActionState } from "./actions";

export function PersonalInfoForm({
  fullName,
  phone,
  email,
  country,
  state,
  city,
  area,
}: {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  state: string;
  city: string;
  area: string;
}) {
  const [formState, formAction, pending] = useActionState<ActionState, FormData>(updatePersonalInfoAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Personal information</h2>
      <form action={formAction} className="mt-4 space-y-4">
        {formState?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formState.error}</p>}
        {formState?.success && (
          <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{formState.success}</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" defaultValue={fullName} required />
            {formState?.fieldErrors?.fullName && <FieldError>{formState.fieldErrors.fullName[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={phone} placeholder="+234..." />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue={country || "Nigeria"} required />
            {formState?.fieldErrors?.country && <FieldError>{formState.fieldErrors.country[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={state || "FCT"} required />
            {formState?.fieldErrors?.state && <FieldError>{formState.fieldErrors.state[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={city || "Abuja"} required />
            {formState?.fieldErrors?.city && <FieldError>{formState.fieldErrors.city[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="area">Area</Label>
            <Input id="area" name="area" defaultValue={area} placeholder="e.g. Wuse 2" />
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save personal information"}
        </Button>
      </form>
    </Card>
  );
}
