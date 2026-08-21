"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { registerAction, type ActionState } from "@/app/(auth)/actions";

export function RegisterForm({ role }: { role: "JOB_SEEKER" | "EMPLOYER" }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(registerAction, null);

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-semibold text-slate-900">
        {role === "JOB_SEEKER" ? "Create your job seeker account" : "Create your employer account"}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        <Link href="/register" className="text-brand-600 hover:underline">
          Not {role === "JOB_SEEKER" ? "looking for a job" : "hiring"}?
        </Link>
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="role" value={role} />

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required />
          {state?.fieldErrors?.fullName && <FieldError>{state.fieldErrors.fullName[0]}</FieldError>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          {state?.fieldErrors?.email && <FieldError>{state.fieldErrors.email[0]}</FieldError>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          {state?.fieldErrors?.password && <FieldError>{state.fieldErrors.password[0]}</FieldError>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
          {state?.fieldErrors?.confirmPassword && (
            <FieldError>{state.fieldErrors.confirmPassword[0]}</FieldError>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing you agree to WorkBridge&apos;s terms and acknowledge our
        commitment to never require applicants to pay recruitment fees.
      </p>
    </Card>
  );
}
