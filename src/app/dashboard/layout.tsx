import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("JOB_SEEKER");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
