"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { updateCompanyAction, type ActionState } from "./actions";

export function CompanyInfoForm({
  name,
  description,
  industry,
  website,
  email,
  phone,
  country,
  state,
  city,
  area,
  employeeCount,
  yearEstablished,
}: {
  name: string;
  description: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  area: string;
  employeeCount: string | null;
  yearEstablished: number | null;
}) {
  const [formState, formAction, pending] = useActionState<ActionState, FormData>(updateCompanyAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Company profile</h2>
      <form action={formAction} className="mt-4 space-y-4">
        {formState?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formState.error}</p>}
        {formState?.success && (
          <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{formState.success}</p>
        )}

        <div>
          <Label htmlFor="name">Company name</Label>
          <Input id="name" name="name" defaultValue={name} required />
          {formState?.fieldErrors?.name && <FieldError>{formState.fieldErrors.name[0]}</FieldError>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={description} placeholder="What does your company do?" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" defaultValue={industry} placeholder="e.g. Retail" />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={website} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="companyEmail">Company email</Label>
            <Input id="companyEmail" name="email" type="email" defaultValue={email} />
            {formState?.fieldErrors?.email && <FieldError>{formState.fieldErrors.email[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="companyPhone">Company phone</Label>
            <Input id="companyPhone" name="phone" defaultValue={phone} placeholder="+234..." />
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
            <Input id="area" name="area" defaultValue={area} placeholder="e.g. Central Business District" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="employeeCount">Employee count</Label>
            <Select id="employeeCount" name="employeeCount" defaultValue={employeeCount ?? ""}>
              <option value="">Select</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="yearEstablished">Year established</Label>
            <Input
              id="yearEstablished"
              name="yearEstablished"
              type="number"
              min={1900}
              max={new Date().getFullYear()}
              defaultValue={yearEstablished ?? ""}
            />
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save company profile"}
        </Button>
      </form>
    </Card>
  );
}
