import { cn } from "@/lib/utils";
import Link from "next/link";
import { type ComponentProps } from "react";

const variantClasses = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 shadow-sm",
  accent:
    "bg-accent-600 text-white hover:bg-accent-700 focus-visible:outline-accent-600 shadow-sm",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:outline-brand-600",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-brand-600",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 focus-visible:outline-red-600",
} as const;

const sizeClasses = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
} as const;

type Variant = keyof typeof variantClasses;
type Size = keyof typeof sizeClasses;

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}
