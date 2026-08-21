"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { MailWarning } from "lucide-react";
import { resendVerificationAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function VerifyEmailBanner({
  userId,
  email,
  emailVerified,
}: {
  userId: string;
  email: string;
  emailVerified: boolean;
}) {
  const pathname = usePathname();
  const devVerifyUrl = useSearchParams().get("devVerifyUrl");

  if (emailVerified) return null;

  const resendWithArgs = resendVerificationAction.bind(null, userId, email, pathname);

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2">
          <MailWarning className="size-4 shrink-0" />
          Verify your email address ({email}) to unlock all features.
        </span>
        <form action={resendWithArgs}>
          <Button type="submit" variant="secondary" size="sm">
            Resend verification email
          </Button>
        </form>
      </div>
      {devVerifyUrl && (
        <div className="border-t border-amber-200 bg-amber-100/60 px-4 py-2 text-xs text-amber-900 sm:px-6 lg:px-8">
          Dev mode &mdash; no email provider configured. Verify with:{" "}
          <a href={devVerifyUrl} className="break-all font-medium underline">
            {devVerifyUrl}
          </a>
        </div>
      )}
    </div>
  );
}
