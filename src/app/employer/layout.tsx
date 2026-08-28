import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUnreadConversationCount } from "@/lib/messaging";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("EMPLOYER");
  const unread = await getUnreadConversationCount(user.id);

  const navLinks = [
    { href: "/employer/dashboard", label: "Dashboard" },
    { href: "/employer/jobs", label: "Jobs" },
    { href: "/employer/messages", label: unread > 0 ? `Messages (${unread})` : "Messages" },
    { href: "/employer/company", label: "Company" },
    { href: "/employer/settings", label: "Settings" },
  ];

  return (
    <DashboardShell user={user} navLinks={navLinks}>
      {children}
    </DashboardShell>
  );
}
