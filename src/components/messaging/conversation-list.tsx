import Link from "next/link";
import { Building2, MessageSquareOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";

export type ConversationListItem = {
  id: string;
  jobTitle: string | null;
  otherName: string;
  otherPhoto: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string;
  unreadCount: number;
  isBlocked: boolean;
};

export function ConversationList({
  conversations,
  basePath,
}: {
  conversations: ConversationListItem[];
  basePath: string;
}) {
  if (conversations.length === 0) {
    return (
      <Card className="text-center text-sm text-slate-500">
        No conversations yet. Messages tied to your applications will appear here.
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((c) => (
        <Link key={c.id} href={`${basePath}/${c.id}`}>
          <Card className="flex items-center gap-3 transition-shadow hover:shadow-card-hover">
            {c.otherPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.otherPhoto} alt={c.otherName} className="size-11 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Building2 className="size-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`truncate font-medium ${c.unreadCount > 0 ? "text-slate-900" : "text-slate-700"}`}>
                  {c.otherName}
                </span>
                {c.isBlocked && (
                  <Badge tone="neutral" className="gap-1">
                    <MessageSquareOff className="size-3" />
                    Blocked
                  </Badge>
                )}
              </div>
              {c.jobTitle && <p className="truncate text-xs text-slate-400">{c.jobTitle}</p>}
              {c.lastMessageBody && (
                <p className={`truncate text-sm ${c.unreadCount > 0 ? "font-medium text-slate-700" : "text-slate-500"}`}>
                  {c.lastMessageBody}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-xs text-slate-400">{formatRelativeDate(c.lastMessageAt)}</span>
              {c.unreadCount > 0 && <Badge tone="brand">{c.unreadCount}</Badge>}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
