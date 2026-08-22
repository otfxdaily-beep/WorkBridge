import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  const linkClasses = (disabled: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
      disabled && "pointer-events-none opacity-40"
    );

  return (
    <nav className="mt-8 flex items-center justify-between">
      <Link href={buildHref(currentPage - 1)} aria-disabled={prevDisabled} className={linkClasses(prevDisabled)}>
        <ChevronLeft className="size-4" />
        Previous
      </Link>
      <span className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </span>
      <Link href={buildHref(currentPage + 1)} aria-disabled={nextDisabled} className={linkClasses(nextDisabled)}>
        Next
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
