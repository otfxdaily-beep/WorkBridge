"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import type { ActionState } from "./actions";

type Category = { id: string; name: string };

type JobFormValues = {
  title: string;
  categoryId: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  country: string;
  state: string;
  city: string;
  area: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFrequency: string;
  employmentType: string;
  workArrangement: string;
  experienceLevel: string;
  numberOfOpenings: number;
  deadline: string;
};

export function JobForm({
  categories,
  initialValues,
  action,
  submitLabel,
}: {
  categories: Category[];
  initialValues?: Partial<JobFormValues>;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const v = initialValues ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <Card>
        <h2 className="font-semibold text-slate-900">Basics</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="title">Job title</Label>
            <Input id="title" name="title" defaultValue={v.title} placeholder="e.g. Sales Representative" required />
            {state?.fieldErrors?.title && <FieldError>{state.fieldErrors.title[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={v.categoryId ?? ""} required>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {state?.fieldErrors?.categoryId && <FieldError>{state.fieldErrors.categoryId[0]}</FieldError>}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Description</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="description">Job description</Label>
            <Textarea id="description" name="description" defaultValue={v.description} className="min-h-36" required />
            {state?.fieldErrors?.description && <FieldError>{state.fieldErrors.description[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <Textarea id="responsibilities" name="responsibilities" defaultValue={v.responsibilities} />
          </div>
          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" name="requirements" defaultValue={v.requirements} />
          </div>
          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea id="benefits" name="benefits" defaultValue={v.benefits} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Location</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue={v.country || "Nigeria"} required />
            {state?.fieldErrors?.country && <FieldError>{state.fieldErrors.country[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" defaultValue={v.state || "FCT"} required />
            {state?.fieldErrors?.state && <FieldError>{state.fieldErrors.state[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" defaultValue={v.city || "Abuja"} required />
            {state?.fieldErrors?.city && <FieldError>{state.fieldErrors.city[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="area">Area</Label>
            <Input id="area" name="area" defaultValue={v.area} placeholder="e.g. Wuse 2" />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Compensation &amp; type</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="salaryMin">Salary minimum (&#8358;)</Label>
            <Input id="salaryMin" name="salaryMin" type="number" min={0} defaultValue={v.salaryMin ?? ""} />
          </div>
          <div>
            <Label htmlFor="salaryMax">Salary maximum (&#8358;)</Label>
            <Input id="salaryMax" name="salaryMax" type="number" min={0} defaultValue={v.salaryMax ?? ""} />
          </div>
          <div>
            <Label htmlFor="salaryFrequency">Salary frequency</Label>
            <Select id="salaryFrequency" name="salaryFrequency" defaultValue={v.salaryFrequency ?? "MONTHLY"}>
              <option value="HOURLY">Hourly</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUAL">Annual</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="employmentType">Employment type</Label>
            <Select id="employmentType" name="employmentType" defaultValue={v.employmentType ?? "FULL_TIME"}>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TEMPORARY">Temporary</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="workArrangement">Work arrangement</Label>
            <Select id="workArrangement" name="workArrangement" defaultValue={v.workArrangement ?? "ON_SITE"}>
              <option value="ON_SITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="experienceLevel">Experience level</Label>
            <Select id="experienceLevel" name="experienceLevel" defaultValue={v.experienceLevel ?? "ENTRY"}>
              <option value="ENTRY">Entry level</option>
              <option value="MID">Mid level</option>
              <option value="SENIOR">Senior level</option>
              <option value="EXECUTIVE">Executive</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="numberOfOpenings">Number of openings</Label>
            <Input
              id="numberOfOpenings"
              name="numberOfOpenings"
              type="number"
              min={1}
              max={999}
              defaultValue={v.numberOfOpenings ?? 1}
              required
            />
          </div>
          <div>
            <Label htmlFor="deadline">Application deadline</Label>
            <Input id="deadline" name="deadline" type="date" defaultValue={v.deadline} />
          </div>
        </div>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
