"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { updatePreferencesAction, type ActionState } from "./actions";

export function PreferencesForm({
  desiredJobTitle,
  country,
  state,
  city,
  minSalary,
  maxSalary,
  employmentType,
  workArrangement,
  availability,
}: {
  desiredJobTitle: string;
  country: string;
  state: string;
  city: string;
  minSalary: number | null;
  maxSalary: number | null;
  employmentType: string | null;
  workArrangement: string | null;
  availability: string | null;
}) {
  const [formState, formAction, pending] = useActionState<ActionState, FormData>(updatePreferencesAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Job preferences</h2>
      <form action={formAction} className="mt-4 space-y-4">
        {formState?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formState.error}</p>}
        {formState?.success && (
          <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{formState.success}</p>
        )}

        <div>
          <Label htmlFor="desiredJobTitle">Desired job title</Label>
          <Input id="desiredJobTitle" name="desiredJobTitle" defaultValue={desiredJobTitle} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="prefCountry">Preferred country</Label>
            <Input id="prefCountry" name="country" defaultValue={country || "Nigeria"} />
          </div>
          <div>
            <Label htmlFor="prefState">Preferred state</Label>
            <Input id="prefState" name="state" defaultValue={state || "FCT"} />
          </div>
          <div>
            <Label htmlFor="prefCity">Preferred city</Label>
            <Input id="prefCity" name="city" defaultValue={city || "Abuja"} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="minSalary">Minimum salary (&#8358;/month)</Label>
            <Input id="minSalary" name="minSalary" type="number" min={0} defaultValue={minSalary ?? ""} />
          </div>
          <div>
            <Label htmlFor="maxSalary">Maximum salary (&#8358;/month)</Label>
            <Input id="maxSalary" name="maxSalary" type="number" min={0} defaultValue={maxSalary ?? ""} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="employmentType">Employment type</Label>
            <Select id="employmentType" name="employmentType" defaultValue={employmentType ?? ""}>
              <option value="">Any</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TEMPORARY">Temporary</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="workArrangement">Work arrangement</Label>
            <Select id="workArrangement" name="workArrangement" defaultValue={workArrangement ?? ""}>
              <option value="">Any</option>
              <option value="ON_SITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="availability">Availability</Label>
            <Select id="availability" name="availability" defaultValue={availability ?? ""}>
              <option value="">Not specified</option>
              <option value="IMMEDIATE">Immediate</option>
              <option value="TWO_WEEKS">2 weeks notice</option>
              <option value="ONE_MONTH">1 month notice</option>
              <option value="NEGOTIABLE">Negotiable</option>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save preferences"}
        </Button>
      </form>
    </Card>
  );
}
