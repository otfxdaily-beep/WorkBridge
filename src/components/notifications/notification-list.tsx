import Link from "next/link";
import {
  Send,
  Eye,
  Star,
  CalendarCheck,
  CalendarClock,
  MessageCircle,
  Sparkles,
  XCircle,
  PartyPopper,
  Trophy,
  ShieldCheck,
  ShieldX,
  Flag,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import type { NotificationType } from "@/generated/prisma/client";

const ICONS: Record<NotificationType, typeof Send> = {
  NEW_APPLICATION: Sparkles,
  APPLICATION_SUBMITTED: Send,
  APPLICATION_VIEWED: Eye,
  APPLICATION_SHORTLISTED: Star,
  INTERVIEW_SCHEDULED: CalendarCheck,
  INTERVIEW_RESPONSE: CalendarClock,
  NEW_MESSAGE: MessageCircle,
  JOB_RECOMMENDATION: Sparkles,
  APPLICATION_REJECTED: XCircle,
  APPLICATION_HIRED: Trophy,
  OFFER_RECEIVED: PartyPopper,
  VERIFICATION_APPROVED: ShieldCheck,
  VERIFICATION_REJECTED: ShieldX,
  REPORT_UPDATE: Flag,
  JOB_APPROVED: CheckCircle2,
  JOB_REJECTED: Ban,
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  if (notifications.length === 0) {
    return <Card className="text-center text-sm text-slate-500">No notifications yet.</Card>;
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => {
        const Icon = ICONS[n.type];
        const content = (
          <Card
            className={`flex items-start gap-3 ${n.isRead ? "" : "border-brand-200 bg-brand-50/40"} ${n.link ? "transition-shadow hover:shadow-card-hover" : ""}`}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${n.isRead ? "text-slate-700" : "font-semibold text-slate-900"}`}>{n.title}</p>
              {n.body && <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>}
              <p className="mt-1 text-xs text-slate-400">{formatRelativeDate(n.createdAt)}</p>
            </div>
            {!n.isRead && <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-600" aria-label="Unread" />}
          </Card>
        );

        return n.link ? (
          <Link key={n.id} href={n.link}>
            {content}
          </Link>
        ) : (
          <div key={n.id}>{content}</div>
        );
      })}
    </div>
  );
}
