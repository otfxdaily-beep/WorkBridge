"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { addEducationAction, deleteEducationAction, type ActionState } from "./actions";

type EducationItem = {
  id: string;
  institution: string;
  qualification: string;
  field: string | null;
  startDate: string;
  endDate: string | null;
};

function formatYear(date: string) {
  return new Intl.DateTimeFormat("en-NG", { year: "numeric" }).format(new Date(date));
}

export function EducationSection({ educations }: { educations: EducationItem[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addEducationAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Education</h2>

      <ul className="mt-4 space-y-3">
        {educations.map((edu) => (
          <li key={edu.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-4">
            <div>
              <p className="font-medium text-slate-900">
                {edu.qualification}
                {edu.field ? `, ${edu.field}` : ""}
              </p>
              <p className="text-sm text-slate-600">{edu.institution}</p>
              <p className="text-xs text-slate-400">
                {formatYear(edu.startDate)} &ndash; {edu.endDate ? formatYear(edu.endDate) : "Present"}
              </p>
            </div>
            <form action={deleteEducationAction.bind(null, edu.id)}>
              <button type="submit" aria-label="Delete education" className="text-slate-400 hover:text-red-600">
                <Trash2 className="size-4" />
              </button>
            </form>
          </li>
        ))}
        {educations.length === 0 && <p className="text-sm text-slate-500">No education added yet.</p>}
      </ul>

      <form action={formAction} className="mt-5 space-y-4 border-t border-slate-100 pt-5">
        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input id="institution" name="institution" required />
            {state?.fieldErrors?.institution && <FieldError>{state.fieldErrors.institution[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="qualification">Qualification</Label>
            <Input id="qualification" name="qualification" placeholder="e.g. B.Sc" required />
            {state?.fieldErrors?.qualification && <FieldError>{state.fieldErrors.qualification[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="field">Field of study</Label>
            <Input id="field" name="field" placeholder="e.g. Computer Science" />
          </div>
          <div />
          <div>
            <Label htmlFor="eduStartDate">Start date</Label>
            <Input id="eduStartDate" name="startDate" type="date" required />
          </div>
          <div>
            <Label htmlFor="eduEndDate">End date</Label>
            <Input id="eduEndDate" name="endDate" type="date" />
          </div>
        </div>

        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Adding..." : "Add education"}
        </Button>
      </form>
    </Card>
  );
}
