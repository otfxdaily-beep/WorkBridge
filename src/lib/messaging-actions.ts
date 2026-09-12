"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { findOrCreateConversationForApplication } from "@/lib/messaging";
import { createNotification } from "@/lib/notifications";
import type { ReportReason, Conversation } from "@/generated/prisma/client";

async function requireParticipant(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversation = await prisma.conversation.findUniqueOrThrow({ where: { id: conversationId } });
  if (conversation.jobSeekerUserId !== user.id && conversation.employerUserId !== user.id) {
    redirect("/");
  }
  return { user, conversation };
}

function basePathFor(userId: string, conversation: Conversation) {
  return conversation.jobSeekerUserId === userId ? "/dashboard/messages" : "/employer/messages";
}

export async function startConversationFromApplicationAction(applicationId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversation = await findOrCreateConversationForApplication(applicationId);
  redirect(`${basePathFor(user.id, conversation)}/${conversation.id}`);
}

export type MessageActionState = { error?: string } | null;

export async function sendMessageAction(
  conversationId: string,
  _prevState: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const { user, conversation } = await requireParticipant(conversationId);
  if (conversation.blockedByUserId) return { error: "This conversation is blocked." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Message can't be empty." };
  if (body.length > 4000) return { error: "Message is too long." };

  await prisma.$transaction([
    prisma.message.create({ data: { conversationId, senderId: user.id, body } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } }),
  ]);

  const recipientId = conversation.jobSeekerUserId === user.id ? conversation.employerUserId : conversation.jobSeekerUserId;
  await createNotification(recipientId, "NEW_MESSAGE", "New message", {
    body: body.length > 140 ? `${body.slice(0, 140)}...` : body,
    link: `${basePathFor(recipientId, conversation)}/${conversationId}`,
  });

  revalidatePath(`${basePathFor(user.id, conversation)}/${conversationId}`);
  return null;
}

export async function blockConversationAction(conversationId: string) {
  const { user, conversation } = await requireParticipant(conversationId);
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { blockedByUserId: user.id, blockedAt: new Date() },
  });
  revalidatePath(`${basePathFor(user.id, conversation)}/${conversationId}`);
}

export async function unblockConversationAction(conversationId: string) {
  const { user, conversation } = await requireParticipant(conversationId);
  if (conversation.blockedByUserId !== user.id) return;
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { blockedByUserId: null, blockedAt: null },
  });
  revalidatePath(`${basePathFor(user.id, conversation)}/${conversationId}`);
}

const CONVERSATION_REPORT_REASONS: ReportReason[] = ["SCAM", "MONEY_REQUEST", "HARASSMENT", "SUSPICIOUS_BEHAVIOR", "OTHER"];

export type ReportActionState = { error?: string; success?: string } | null;

export async function reportConversationAction(
  conversationId: string,
  _prevState: ReportActionState,
  formData: FormData
): Promise<ReportActionState> {
  const { user, conversation } = await requireParticipant(conversationId);
  const otherUserId = conversation.jobSeekerUserId === user.id ? conversation.employerUserId : conversation.jobSeekerUserId;

  const reason = String(formData.get("reason") ?? "") as ReportReason;
  const description = String(formData.get("description") ?? "").trim();

  if (!CONVERSATION_REPORT_REASONS.includes(reason)) return { error: "Choose a reason." };

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType: "USER",
      targetUserId: otherUserId,
      targetConversationId: conversationId,
      reason,
      description: description || null,
    },
  });

  return { success: "Report submitted. Our team will review it." };
}
