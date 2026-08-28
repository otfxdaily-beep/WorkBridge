import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { getConversationsForUser } from "@/lib/messaging";
import { ConversationList } from "@/components/messaging/conversation-list";

export const metadata: Metadata = { title: "Messages" };

export default async function JobSeekerMessagesPage() {
  const user = await requireRole("JOB_SEEKER");
  const conversations = await getConversationsForUser(user.id);

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
      <p className="mt-1 text-slate-600">Conversations with employers about jobs you&apos;ve applied to.</p>
      <div className="mt-6">
        <ConversationList conversations={conversations} basePath="/dashboard/messages" />
      </div>
    </Container>
  );
}
