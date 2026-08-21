import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { verifyEmailToken } from "@/lib/auth/verify";

export const metadata: Metadata = { title: "Verify Email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await verifyEmailToken(token) : { ok: false as const };

  return (
    <Card className="w-full max-w-md text-center">
      {result.ok ? (
        <>
          <CheckCircle2 className="mx-auto size-10 text-accent-600" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Email verified</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your email address has been verified. You&apos;re all set.
          </p>
        </>
      ) : (
        <>
          <XCircle className="mx-auto size-10 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Link invalid or expired</h1>
          <p className="mt-2 text-sm text-slate-600">
            This verification link is no longer valid. You can request a new one from your dashboard.
          </p>
        </>
      )}
      <ButtonLink href="/login" variant="secondary" className="mt-6">
        Continue to log in
      </ButtonLink>
      <p className="mt-4 text-xs text-slate-400">
        <Link href="/" className="hover:underline">Back to home</Link>
      </p>
    </Card>
  );
}
