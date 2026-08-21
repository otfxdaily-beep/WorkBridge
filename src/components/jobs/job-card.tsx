import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { CardHoverable } from "@/components/ui/card";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { formatSalaryRange, formatRelativeDate, titleCase } from "@/lib/utils";
import type { JobCardData } from "@/types";

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block">
      <CardHoverable className="h-full">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Building2 className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-slate-900">{job.title}</h3>
              {job.matchScore != null && (
                <Badge tone="brand">{job.matchScore}% Match</Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-600">{job.companyName}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {job.city}, {job.state}
          </span>
          <span>{titleCase(job.employmentType)}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryFrequency)}
            </p>
            <p className="text-xs text-slate-400">{formatRelativeDate(job.postedAt)}</p>
          </div>
          {job.isVerified && <VerifiedBadge />}
        </div>
      </CardHoverable>
    </Link>
  );
}
