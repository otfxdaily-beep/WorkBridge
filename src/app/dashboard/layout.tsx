import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadConversationCount } from "@/lib/messaging";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function JobSeekerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("JOB_SEEKER");
  const [unreadMessages, unreadNotifications] = await Promise.all([
    getUnreadConversationCount(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/dashboard/applications", label: "Applications" },
    { href: "/dashboard/messages", label: unreadMessages > 0 ? `Messages (${unreadMessages})` : "Messages" },
    {
      href: "/dashboard/notifications",
      label: unreadNotifications > 0 ? `Notifications (${unreadNotifications})` : "Notifications",
    },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
