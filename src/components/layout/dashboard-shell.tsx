import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
import { logoutAction } from "@/app/(auth)/actions";
import { titleCase } from "@/lib/utils";
import type { UserRole } from "@/generated/prisma/client";

export function DashboardShell({
  user,
  children,
}: {
  user: { id: string; email: string; role: UserRole; emailVerified: boolean };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Badge tone="neutral">{titleCase(user.role)}</Badge>
            <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <VerifyEmailBanner userId={user.id} email={user.email} emailVerified={user.emailVerified} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
