"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { resetPasswordAction, type ActionState } from "@/app/(auth)/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(resetPasswordAction, null);

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-semibold text-slate-900">Choose a new password</h1>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          {state?.fieldErrors?.password && <FieldError>{state.fieldErrors.password[0]}</FieldError>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
          {state?.fieldErrors?.confirmPassword && (
            <FieldError>{state.fieldErrors.confirmPassword[0]}</FieldError>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
