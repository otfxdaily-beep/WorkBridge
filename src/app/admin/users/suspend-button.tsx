"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { suspendUserAction, type SuspendUserActionState } from "./actions";

export function SuspendUserButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const action = suspendUserAction.bind(null, userId);
  const [state, formAction, pending] = useActionState<SuspendUserActionState, FormData>(action, null);

  return (
    <div>
      <Button type="button" variant="danger" size="sm" onClick={() => setOpen((v) => !v)}>
        Suspend
      </Button>

      {open && (
        <form action={formAction} className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3 sm:w-72">
          <Label htmlFor={`reason-${userId}`} className="text-xs">
            Reason (optional, kept in the audit log)
          </Label>
          <Textarea id={`reason-${userId}`} name="reason" className="min-h-14" />
          {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
          <Button type="submit" variant="danger" size="sm" disabled={pending}>
            {pending ? "Suspending..." : "Confirm suspension"}
          </Button>
        </form>
      )}
    </div>
  );
}
