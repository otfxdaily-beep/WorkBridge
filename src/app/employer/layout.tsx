import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("EMPLOYER");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
