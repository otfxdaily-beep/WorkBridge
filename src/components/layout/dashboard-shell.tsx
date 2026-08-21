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
  navLinks = [],
  children,
}: {
  user: { id: string; email: string; role: UserRole; emailVerified: boolean };
  navLinks?: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
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
        {navLinks.length > 0 && (
          <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1.5 sm:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <VerifyEmailBanner userId={user.id} email={user.email} emailVerified={user.emailVerified} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
