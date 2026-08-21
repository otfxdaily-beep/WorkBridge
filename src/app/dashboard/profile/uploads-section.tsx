"use client";

import { useActionState } from "react";
import { FileText, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { uploadPhotoAction, uploadCvAction, type ActionState } from "./actions";

export function UploadsSection({
  photoUrl,
  cvOriginalName,
}: {
  photoUrl: string | null;
  cvOriginalName: string | null;
}) {
  const [photoState, photoAction, photoPending] = useActionState<ActionState, FormData>(uploadPhotoAction, null);
  const [cvState, cvAction, cvPending] = useActionState<ActionState, FormData>(uploadCvAction, null);

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Photo & CV</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <form action={photoAction} className="space-y-3">
          <Label htmlFor="photo">Profile photo</Label>
          <div className="flex items-center gap-3">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Profile" className="size-14 rounded-full object-cover" />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ImagePlus className="size-6" />
              </div>
            )}
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
          </div>
          {photoState?.error && <p className="text-xs text-red-600">{photoState.error}</p>}
          {photoState?.success && <p className="text-xs text-accent-700">{photoState.success}</p>}
          <Button type="submit" size="sm" variant="secondary" disabled={photoPending}>
            {photoPending ? "Uploading..." : "Upload photo"}
          </Button>
        </form>

        <form action={cvAction} className="space-y-3">
          <Label htmlFor="cv">CV (PDF, DOC or DOCX, max 5MB)</Label>
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FileText className="size-6" />
            </div>
            <input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="block flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
          </div>
          {cvOriginalName && <p className="text-xs text-slate-500">Current: {cvOriginalName}</p>}
          {cvState?.error && <p className="text-xs text-red-600">{cvState.error}</p>}
          {cvState?.success && <p className="text-xs text-accent-700">{cvState.success}</p>}
          <Button type="submit" size="sm" variant="secondary" disabled={cvPending}>
            {cvPending ? "Uploading..." : "Upload CV"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
