import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getConversationThread } from "@/lib/messaging";
import { MessageThread } from "@/components/messaging/message-thread";
import { MessageForm } from "@/components/messaging/message-form";
import { ConversationControls } from "@/components/messaging/conversation-controls";

export const metadata: Metadata = { title: "Conversation" };

export default async function JobSeekerMessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("JOB_SEEKER");
  const thread = await getConversationThread(id, user.id);
  if (!thread) notFound();

  return (
    <Container className="max-w-2xl py-10">
      <Link href="/dashboard/messages" className="text-sm text-brand-600 hover:underline">
        &larr; Messages
      </Link>

      <Card className="mt-4">
        <div>
          <h1 className="font-semibold text-slate-900">{thread.otherName}</h1>
          {thread.jobTitle && <p className="text-sm text-slate-500">{thread.jobTitle}</p>}
        </div>

        <div className="mt-4">
          <ConversationControls conversationId={thread.id} isBlocked={thread.isBlocked} blockedByMe={thread.blockedByMe} />
        </div>

        <MessageThread messages={thread.messages} meUserId={user.id} />

        {thread.isBlocked ? (
          <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">
            You can&apos;t send messages in a blocked conversation.
          </p>
        ) : (
          <MessageForm conversationId={thread.id} />
        )}
      </Card>
    </Container>
  );
}
