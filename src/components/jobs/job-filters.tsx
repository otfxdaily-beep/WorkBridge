import { Search } from "lucide-react";
import { Input, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SortSelect } from "./sort-select";
import { prisma } from "@/lib/prisma";
import type { JobSearchParams } from "@/lib/jobs";

export async function JobFilters({ params }: { params: JobSearchParams }) {
  const locations = await prisma.location.findMany({
    where: { jobs: { some: { status: "PUBLISHED" } } },
    orderBy: [{ state: "asc" }, { city: "asc" }],
  });

  return (
    <form method="GET" action="/jobs" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            name="q"
            defaultValue={params.q}
            placeholder="Job title, keyword, company or skill"
            className="pl-9"
          />
        </div>
        <Button type="submit" className="sm:w-auto">
          Search
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <Label htmlFor="location" className="text-xs">Location</Label>
          <Select id="location" name="location" defaultValue={params.location ?? ""}>
            <option value="">Any location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.city}, {loc.state}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="minSalary" className="text-xs">Min. salary</Label>
          <Input id="minSalary" name="minSalary" type="number" min={0} defaultValue={params.minSalary ?? ""} placeholder="₦" />
        </div>

        <div>
          <Label htmlFor="employmentType" className="text-xs">Employment type</Label>
          <Select id="employmentType" name="employmentType" defaultValue={params.employmentType ?? ""}>
            <option value="">Any type</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="TEMPORARY">Temporary</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="experienceLevel" className="text-xs">Experience</Label>
          <Select id="experienceLevel" name="experienceLevel" defaultValue={params.experienceLevel ?? ""}>
            <option value="">Any level</option>
            <option value="ENTRY">Entry</option>
            <option value="MID">Mid</option>
            <option value="SENIOR">Senior</option>
            <option value="EXECUTIVE">Executive</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="workArrangement" className="text-xs">Work arrangement</Label>
          <Select id="workArrangement" name="workArrangement" defaultValue={params.workArrangement ?? ""}>
            <option value="">Any arrangement</option>
            <option value="ON_SITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="datePosted" className="text-xs">Date posted</Label>
          <Select id="datePosted" name="datePosted" defaultValue={params.datePosted ?? ""}>
            <option value="">Any time</option>
            <option value="24h">Past 24 hours</option>
            <option value="7d">Past week</option>
            <option value="30d">Past month</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="verifiedOnly"
            defaultChecked={params.verifiedOnly === "on"}
            className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Verified employers only
        </label>

        <div className="w-48">
          <SortSelect defaultValue={params.sort ?? "relevance"} />
        </div>
      </div>
    </form>
  );
}
