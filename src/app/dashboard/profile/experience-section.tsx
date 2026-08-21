"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { addExperienceAction, deleteExperienceAction, type ActionState } from "./actions";

type ExperienceItem = {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
};

function formatMonth(date: string) {
  return new Intl.DateTimeFormat("en-NG", { month: "short", year: "numeric" }).format(new Date(date));
}

export function ExperienceSection({ experiences }: { experiences: ExperienceItem[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addExperienceAction, null);
  const [isCurrent, setIsCurrent] = useState(false);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Work experience</h2>

      <ul className="mt-4 space-y-3">
        {experiences.map((exp) => (
          <li key={exp.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-4">
            <div>
              <p className="font-medium text-slate-900">{exp.jobTitle}</p>
              <p className="text-sm text-slate-600">{exp.company}</p>
              <p className="text-xs text-slate-400">
                {formatMonth(exp.startDate)} &ndash; {exp.isCurrent ? "Present" : exp.endDate ? formatMonth(exp.endDate) : ""}
              </p>
              {exp.description && <p className="mt-1.5 text-sm text-slate-600">{exp.description}</p>}
            </div>
            <form action={deleteExperienceAction.bind(null, exp.id)}>
              <button type="submit" aria-label="Delete experience" className="text-slate-400 hover:text-red-600">
                <Trash2 className="size-4" />
              </button>
            </form>
          </li>
        ))}
        {experiences.length === 0 && <p className="text-sm text-slate-500">No experience added yet.</p>}
      </ul>

      <form action={formAction} className="mt-5 space-y-4 border-t border-slate-100 pt-5">
        {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="jobTitle">Job title</Label>
            <Input id="jobTitle" name="jobTitle" required />
            {state?.fieldErrors?.jobTitle && <FieldError>{state.fieldErrors.jobTitle[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" required />
            {state?.fieldErrors?.company && <FieldError>{state.fieldErrors.company[0]}</FieldError>}
          </div>
          <div>
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" name="startDate" type="date" required />
          </div>
          <div>
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" name="endDate" type="date" disabled={isCurrent} />
            {state?.fieldErrors?.endDate && <FieldError>{state.fieldErrors.endDate[0]}</FieldError>}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isCurrent"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          I currently work here
        </label>

        <div>
          <Label htmlFor="expDescription">Description</Label>
          <Textarea id="expDescription" name="description" placeholder="Key responsibilities and achievements" />
        </div>

        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Adding..." : "Add experience"}
        </Button>
      </form>
    </Card>
  );
}
