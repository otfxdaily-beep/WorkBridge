import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/dashboard/applications", label: "Applications" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default async function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("JOB_SEEKER");
  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
