import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { CardHoverable } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/badge";
import type { CompanyCardData } from "@/types";

export function CompanyCard({ company }: { company: CompanyCardData }) {
  return (
    <Link href={`/companies/${company.id}`} className="block">
      <CardHoverable className="h-full">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Building2 className="size-6" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">{company.name}</h3>
            <p className="truncate text-sm text-slate-500">{company.industry ?? "Company"}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="size-3.5" />
              {company.city}, {company.state}
            </span>
            <p className="text-xs text-slate-400">{company.openJobs} open roles</p>
          </div>
          {company.isVerified && <VerifiedBadge />}
        </div>
      </CardHoverable>
    </Link>
  );
}
