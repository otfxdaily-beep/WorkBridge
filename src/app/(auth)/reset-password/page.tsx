import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Card className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-900">Invalid link</h1>
        <p className="mt-2 text-sm text-slate-600">
          This password reset link is missing its token.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
          Request a new link
        </Link>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}
