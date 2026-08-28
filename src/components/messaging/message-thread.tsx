import { cn, formatRelativeDate } from "@/lib/utils";

export type ThreadMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export function MessageThread({ messages, meUserId }: { messages: ThreadMessage[]; meUserId: string }) {
  if (messages.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No messages yet. Say hello!</p>;
  }

  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((m) => {
        const isMe = m.senderId === meUserId;
        return (
          <div key={m.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                isMe ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
              )}
            >
              {m.body}
            </div>
            <span className="mt-1 text-xs text-slate-400">
              {formatRelativeDate(m.createdAt)}
              {isMe && m.readAt && " · Read"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
