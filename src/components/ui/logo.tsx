import { cn } from "@/lib/utils";

/**
 * The mark is two facing brackets bridged by a dot — two sides (talent /
 * opportunity) meeting in the middle.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <path
        d="M11 6C7.5 6 5 9 5 12.5v7C5 23 7.5 26 11 26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M21 6c3.5 0 6 3 6 6.5v7c0 3.5-2.5 6.5-6 6.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-accent-500"
      />
      <circle cx="16" cy="16" r="2.75" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-brand-700", className)}>
      <LogoMark className={cn("text-brand-600", markClassName)} />
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        Work<span className="text-brand-600">Bridge</span>
      </span>
    </span>
  );
}
