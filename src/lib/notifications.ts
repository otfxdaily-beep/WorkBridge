import "server-only";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/generated/prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  opts?: { body?: string; link?: string }
) {
  await prisma.notification.create({
    data: { userId, type, title, body: opts?.body, link: opts?.link },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

/**
 * Returns the user's recent notifications (unread state as of the moment of
 * the call), then marks everything read - same "viewing marks it read"
 * pattern already used for message threads and applicant profile views.
 */
export async function getNotificationsAndMarkRead(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return notifications;
}
