"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select, FieldError } from "@/components/ui/input";
import { updateProfessionalInfoAction, type ActionState } from "./actions";

const employmentStatusOptions = [
  { value: "", label: "Select status" },
  { value: "EMPLOYED", label: "Employed" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "STUDENT", label: "Student" },
];

export function ProfessionalInfoForm({
  professionalTitle,
  aboutMe,
  yearsOfExperience,
  currentEmploymentStatus,
}: {
  professionalTitle: string;
  aboutMe: string;
  yearsOfExperience: number | null;
  currentEmploymentStatus: string | null;
}) {
  const [formState, formAction, pending] = useActionState<ActionState, FormData>(updateProfessionalInfoAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Professional information</h2>
      <form action={formAction} className="mt-4 space-y-4">
        {formState?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formState.error}</p>}
        {formState?.success && (
          <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">{formState.success}</p>
        )}

        <div>
          <Label htmlFor="professionalTitle">Professional title</Label>
          <Input
            id="professionalTitle"
            name="professionalTitle"
            defaultValue={professionalTitle}
            placeholder="e.g. Frontend Developer"
          />
        </div>

        <div>
          <Label htmlFor="aboutMe">About me</Label>
          <Textarea id="aboutMe" name="aboutMe" defaultValue={aboutMe} placeholder="A short summary employers will see" />
          {formState?.fieldErrors?.aboutMe && <FieldError>{formState.fieldErrors.aboutMe[0]}</FieldError>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="yearsOfExperience">Years of experience</Label>
            <Input
              id="yearsOfExperience"
              name="yearsOfExperience"
              type="number"
              min={0}
              max={60}
              defaultValue={yearsOfExperience ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="currentEmploymentStatus">Current employment status</Label>
            <Select id="currentEmploymentStatus" name="currentEmploymentStatus" defaultValue={currentEmploymentStatus ?? ""}>
              {employmentStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save professional information"}
        </Button>
      </form>
    </Card>
  );
}
