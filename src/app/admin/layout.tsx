import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const [pendingVerifications, openReports, pendingJobs] = await Promise.all([
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.job.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    {
      href: "/admin/jobs",
      label: pendingJobs > 0 ? `Jobs (${pendingJobs})` : "Jobs",
    },
    {
      href: "/admin/verifications",
      label: pendingVerifications > 0 ? `Verifications (${pendingVerifications})` : "Verifications",
    },
    {
      href: "/admin/reports",
      label: openReports > 0 ? `Reports (${openReports})` : "Reports",
    },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
