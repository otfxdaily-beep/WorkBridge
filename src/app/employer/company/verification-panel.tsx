"use client";

import { useActionState } from "react";
import { ShieldCheck, ShieldQuestion, Clock, ShieldX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { requestVerificationAction, type ActionState } from "./actions";
import type { VerificationStatus } from "@/generated/prisma/client";

const statusMeta: Record<VerificationStatus, { icon: typeof ShieldCheck; label: string; tone: string }> = {
  NOT_VERIFIED: { icon: ShieldQuestion, label: "Not verified", tone: "text-slate-500 bg-slate-100" },
  PENDING: { icon: Clock, label: "Verification pending", tone: "text-amber-700 bg-amber-50" },
  VERIFIED: { icon: ShieldCheck, label: "Verified Employer", tone: "text-accent-700 bg-accent-50" },
  REJECTED: { icon: ShieldX, label: "Verification rejected", tone: "text-red-700 bg-red-50" },
};

export function VerificationPanel({
  status,
  hasCompany,
  rejectionReason,
}: {
  status: VerificationStatus;
  hasCompany: boolean;
  rejectionReason?: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(requestVerificationAction, null);
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <Card>
      <h2 className="font-semibold text-slate-900">Business verification</h2>
      <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${meta.tone}`}>
        <Icon className="size-4" />
        {meta.label}
      </div>

      {status === "REJECTED" && rejectionReason && (
        <p className="mt-3 text-sm text-red-700">Reason: {rejectionReason}</p>
      )}

      {(status === "NOT_VERIFIED" || status === "REJECTED") && (
        <form action={formAction} className="mt-4 space-y-3">
          <p className="text-sm text-slate-600">
            Submit your business registration (e.g. CAC certificate) so our admin team can verify your
            company. Verified employers get a trust badge job seekers can see.
          </p>
          <div>
            <Label htmlFor="document">Registration document (optional, PDF or image)</Label>
            <input
              id="document"
              name="document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
            />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-accent-700">{state.success}</p>}
          <Button type="submit" variant="secondary" disabled={pending || !hasCompany}>
            {pending ? "Submitting..." : "Request verification"}
          </Button>
          {!hasCompany && <p className="text-xs text-slate-400">Save your company profile above first.</p>}
        </form>
      )}

      {status === "PENDING" && (
        <p className="mt-3 text-sm text-slate-600">
          Our team is reviewing your request. This usually takes 1-2 business days.
        </p>
      )}
    </Card>
  );
}
