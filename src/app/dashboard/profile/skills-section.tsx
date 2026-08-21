"use client";

import { useActionState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addSkillAction, removeSkillAction, type ActionState } from "./actions";

type SkillItem = { id: string; name: string; level: string | null };

export function SkillsSection({ skills }: { skills: SkillItem[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addSkillAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Skills</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.length === 0 && <p className="text-sm text-slate-500">No skills added yet.</p>}
        {skills.map((skill) => (
          <Badge key={skill.id} tone="brand" className="gap-1.5 py-1.5">
            {skill.name}
            <form action={removeSkillAction.bind(null, skill.id)}>
              <button type="submit" aria-label={`Remove ${skill.name}`} className="hover:text-red-600">
                <X className="size-3.5" />
              </button>
            </form>
          </Badge>
        ))}
      </div>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <Input name="name" placeholder="e.g. Customer Service" required />
        </div>
        <div className="w-40">
          <Select name="level" defaultValue="">
            <option value="">Level (optional)</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </Select>
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Adding..." : "Add skill"}
        </Button>
      </form>
      {state?.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
    </Card>
  );
}
