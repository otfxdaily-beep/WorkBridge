import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

const fieldBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-400";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldBase, "pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-slate-700", className)}
      {...props}
    />
  );
}

export function FieldHint({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mt-1.5 text-xs text-slate-500", className)} {...props} />;
}

export function FieldError({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mt-1.5 text-xs text-red-600", className)} {...props} />;
}
