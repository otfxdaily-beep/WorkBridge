import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadConversationCount } from "@/lib/messaging";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("EMPLOYER");
  const [unreadMessages, unreadNotifications] = await Promise.all([
    getUnreadConversationCount(user.id),
    getUnreadNotificationCount(user.id),
  ]);

  const navLinks = [
    { href: "/employer/dashboard", label: "Dashboard" },
    { href: "/employer/jobs", label: "Jobs" },
    { href: "/employer/messages", label: unreadMessages > 0 ? `Messages (${unreadMessages})` : "Messages" },
    {
      href: "/employer/notifications",
      label: unreadNotifications > 0 ? `Notifications (${unreadNotifications})` : "Notifications",
    },
    { href: "/employer/company", label: "Company" },
    { href: "/employer/settings", label: "Settings" },
  ];

  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
