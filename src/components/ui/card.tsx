import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-card",
        className
      )}
      {...props}
    />
  );
}

export function CardHoverable({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover",
        className
      )}
      {...props}
    />
  );
}
