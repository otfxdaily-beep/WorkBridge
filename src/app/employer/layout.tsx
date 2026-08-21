import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const navLinks = [
  { href: "/employer/dashboard", label: "Dashboard" },
  { href: "/employer/company", label: "Company" },
  { href: "/employer/settings", label: "Settings" },
];

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("EMPLOYER");
  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
