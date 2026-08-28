import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadConversationCount } from "@/lib/messaging";

export default async function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("JOB_SEEKER");
  const unread = await getUnreadConversationCount(user.id);

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/dashboard/applications", label: "Applications" },
    { href: "/dashboard/messages", label: unread > 0 ? `Messages (${unread})` : "Messages" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
