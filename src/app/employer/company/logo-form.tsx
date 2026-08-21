"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadLogoAction, type ActionState } from "./actions";

export function LogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(uploadLogoAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Company logo</h2>
      <form action={formAction} className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Company logo" className="size-14 rounded-xl object-cover" />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Building2 className="size-6" />
            </div>
          )}
          <input
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
          />
        </div>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        {state?.success && <p className="text-xs text-accent-700">{state.success}</p>}
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? "Uploading..." : "Upload logo"}
        </Button>
      </form>
    </Card>
  );
}
