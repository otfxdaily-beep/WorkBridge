"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { forgotPasswordAction, type ActionState } from "@/app/(auth)/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(forgotPasswordAction, null);

  if (state?.success) {
    return (
      <Card className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600">{state.success}</p>
        {state.devLinkUrl && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Dev mode &mdash; no email provider configured. Reset with:{" "}
            <a href={state.devLinkUrl} className="break-all font-medium underline">
              {state.devLinkUrl}
            </a>
          </p>
        )}
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
          Back to log in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-semibold text-slate-900">Forgot your password?</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending..." : "Send reset link"}
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
