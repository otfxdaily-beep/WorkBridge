import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";
import { CheckCircle2 } from "lucide-react";

const toneClasses = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-accent-50 text-accent-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
} as const;

type Tone = keyof typeof toneClasses;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="success" className={className}>
      <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
      Verified Employer
    </Badge>
  );
}
