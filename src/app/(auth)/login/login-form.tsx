"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { loginAction, type ActionState } from "@/app/(auth)/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, null);

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-xl font-semibold text-slate-900">Log in</h1>
      <p className="mt-1 text-sm text-slate-600">Welcome back to WorkBridge.</p>

      <form action={formAction} className="mt-6 space-y-4">
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          {state?.fieldErrors?.email && <FieldError>{state.fieldErrors.email[0]}</FieldError>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1.5" />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
