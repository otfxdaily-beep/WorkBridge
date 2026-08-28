"use client";

import { useActionState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { sendMessageAction, type MessageActionState } from "@/lib/messaging-actions";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const action = sendMessageAction.bind(null, conversationId);
  const [state, formAction, pending] = useActionState<MessageActionState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="border-t border-slate-100 pt-4">
      {state?.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          name="body"
          placeholder="Write a message..."
          required
          className="min-h-12 flex-1 resize-none"
          maxLength={4000}
        />
        <Button type="submit" disabled={pending} size="md">
          <Send className="size-4" />
          Send
        </Button>
      </form>
      <p className="mt-1.5 text-xs text-slate-400">
        For your safety, avoid sharing personal contact details until you&apos;re comfortable.
      </p>
    </div>
  );
}
