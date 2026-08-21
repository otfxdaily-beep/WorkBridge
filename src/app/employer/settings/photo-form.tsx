"use client";

import { useActionState } from "react";
import { UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { uploadEmployerPhotoAction, type ActionState } from "./actions";

export function PhotoForm({ photoUrl }: { photoUrl: string | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(uploadEmployerPhotoAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Your photo</h2>
      <form action={formAction} className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Your photo" className="size-14 rounded-full object-cover" />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <UserRound className="size-6" />
            </div>
          )}
          <Label htmlFor="photo" className="mb-0 sr-only">
            Photo
          </Label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
          />
        </div>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        {state?.success && <p className="text-xs text-accent-700">{state.success}</p>}
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? "Uploading..." : "Upload photo"}
        </Button>
      </form>
    </Card>
  );
}
