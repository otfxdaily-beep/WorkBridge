import "server-only";
import { prisma } from "@/lib/prisma";

export async function findOrCreateConversationForApplication(applicationId: string) {
  const existing = await prisma.conversation.findUnique({ where: { applicationId } });
  if (existing) return existing;

  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: { jobSeekerProfile: true, job: true },
  });

  return prisma.conversation.create({
    data: {
      applicationId,
      jobSeekerUserId: application.jobSeekerProfile.userId,
      employerUserId: application.job.postedById,
    },
  });
}

export async function getUnreadConversationCount(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ jobSeekerUserId: userId }, { employerUserId: userId }] },
    select: {
      id: true,
      messages: { where: { senderId: { not: userId }, readAt: null }, select: { id: true } },
    },
  });
  return conversations.filter((c) => c.messages.length > 0).length;
}

export async function getConversationThread(conversationId: string, viewerUserId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      application: { include: { job: { include: { company: true } } } },
      jobSeekerUser: { include: { jobSeekerProfile: true } },
      employerUser: { include: { employerProfile: { include: { company: true } } } },
    },
  });

  if (!conversation) return null;
  if (conversation.jobSeekerUserId !== viewerUserId && conversation.employerUserId !== viewerUserId) return null;

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: viewerUserId }, readAt: null },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  const isJobSeeker = conversation.jobSeekerUserId === viewerUserId;
  const otherName = isJobSeeker
    ? (conversation.employerUser.employerProfile?.company?.name ?? conversation.employerUser.employerProfile?.fullName ?? "Employer")
    : (conversation.jobSeekerUser.jobSeekerProfile?.fullName ?? "Job seeker");

  return {
    id: conversation.id,
    jobTitle: conversation.application?.job.title ?? null,
    otherName,
    isBlocked: Boolean(conversation.blockedByUserId),
    blockedByMe: conversation.blockedByUserId === viewerUserId,
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      readAt: m.readAt?.toISOString() ?? null,
    })),
  };
}

export async function getConversationsForUser(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ jobSeekerUserId: userId }, { employerUserId: userId }] },
    include: {
      application: { include: { job: { include: { company: true } } } },
      jobSeekerUser: { include: { jobSeekerProfile: true } },
      employerUser: { include: { employerProfile: { include: { company: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
  });

  return Promise.all(
    conversations.map(async (c) => {
      const isJobSeeker = c.jobSeekerUserId === userId;
      const otherName = isJobSeeker
        ? (c.employerUser.employerProfile?.company?.name ?? c.employerUser.employerProfile?.fullName ?? "Employer")
        : (c.jobSeekerUser.jobSeekerProfile?.fullName ?? "Job seeker");
      const otherPhoto = isJobSeeker ? c.employerUser.employerProfile?.company?.logoUrl : c.jobSeekerUser.jobSeekerProfile?.photoUrl;
      const unreadCount = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, readAt: null },
      });

      return {
        id: c.id,
        jobTitle: c.application?.job.title ?? null,
        otherName,
        otherPhoto: otherPhoto ?? null,
        lastMessageBody: c.messages[0]?.body ?? null,
        lastMessageAt: (c.lastMessageAt ?? c.createdAt).toISOString(),
        unreadCount,
        isBlocked: Boolean(c.blockedByUserId),
      };
    })
  );
}
