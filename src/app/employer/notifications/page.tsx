import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { getNotificationsAndMarkRead } from "@/lib/notifications";
import { NotificationList } from "@/components/notifications/notification-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function EmployerNotificationsPage() {
  const user = await requireRole("EMPLOYER");
  const notifications = await getNotificationsAndMarkRead(user.id);

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
      <div className="mt-6">
        <NotificationList
          notifications={notifications.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            link: n.link,
            isRead: n.isRead,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </div>
    </Container>
  );
}
