import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const pendingVerifications = await prisma.verification.count({ where: { status: "PENDING" } });

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    {
      href: "/admin/verifications",
      label: pendingVerifications > 0 ? `Verifications (${pendingVerifications})` : "Verifications",
    },
  ];

  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
