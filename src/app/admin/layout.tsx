import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const [pendingVerifications, openReports] = await Promise.all([
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    {
      href: "/admin/verifications",
      label: pendingVerifications > 0 ? `Verifications (${pendingVerifications})` : "Verifications",
    },
    {
      href: "/admin/reports",
      label: openReports > 0 ? `Reports (${openReports})` : "Reports",
    },
  ];

  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
