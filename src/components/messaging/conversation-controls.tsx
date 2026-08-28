"use client";

import { useActionState, useState } from "react";
import { Flag, Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Label } from "@/components/ui/input";
import {
  blockConversationAction,
  unblockConversationAction,
  reportConversationAction,
  type ReportActionState,
} from "@/lib/messaging-actions";

export function ConversationControls({
  conversationId,
  isBlocked,
  blockedByMe,
}: {
  conversationId: string;
  isBlocked: boolean;
  blockedByMe: boolean;
}) {
  const [showReport, setShowReport] = useState(false);
  const reportAction = reportConversationAction.bind(null, conversationId);
  const [reportState, reportFormAction, reportPending] = useActionState<ReportActionState, FormData>(
    reportAction,
    null
  );

  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
      <div className="flex flex-wrap items-center gap-2">
        {isBlocked ? (
          blockedByMe ? (
            <form action={unblockConversationAction.bind(null, conversationId)}>
              <Button type="submit" variant="secondary" size="sm">
                <ShieldCheck className="size-4" />
                Unblock
              </Button>
            </form>
          ) : (
            <span className="text-sm text-slate-500">This conversation is blocked.</span>
          )
        ) : (
          <form action={blockConversationAction.bind(null, conversationId)}>
            <Button type="submit" variant="ghost" size="sm">
              <Ban className="size-4" />
              Block
            </Button>
          </form>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowReport((v) => !v)}>
          <Flag className="size-4" />
          Report
        </Button>
      </div>

      {showReport && !reportState?.success && (
        <form action={reportFormAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
          <div>
            <Label htmlFor="reason" className="text-xs">Reason</Label>
            <Select id="reason" name="reason" required>
              <option value="">Select a reason</option>
              <option value="SCAM">Scam</option>
              <option value="MONEY_REQUEST">Requesting money</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="SUSPICIOUS_BEHAVIOR">Suspicious behavior</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="description" className="text-xs">Details (optional)</Label>
            <Textarea id="description" name="description" className="min-h-16" />
          </div>
          {reportState?.error && <p className="text-xs text-red-600">{reportState.error}</p>}
          <Button type="submit" variant="danger" size="sm" disabled={reportPending}>
            {reportPending ? "Submitting..." : "Submit report"}
          </Button>
        </form>
      )}
      {reportState?.success && <p className="text-sm text-accent-700">{reportState.success}</p>}
    </div>
  );
}
