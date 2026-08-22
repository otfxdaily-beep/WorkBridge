import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/ui/pagination";
import { prisma } from "@/lib/prisma";
import { buildJobWhere, buildJobOrderBy, toJobCardData, JOBS_PAGE_SIZE, type JobSearchParams } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Search jobs in Nigeria on WorkBridge, filter by location, salary, employment type and more.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<JobSearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const where = buildJobWhere(params);
  const orderBy = buildJobOrderBy(params.sort);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      include: { company: true, location: true },
      skip: (page - 1) * JOBS_PAGE_SIZE,
      take: JOBS_PAGE_SIZE,
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE));

  const buildHref = (targetPage: number) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key !== "page" && value) qs.set(key, value);
    }
    if (targetPage > 1) qs.set("page", String(targetPage));
    const query = qs.toString();
    return query ? `/jobs?${query}` : "/jobs";
  };

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Find a job</h1>
      <p className="mt-1 text-slate-600">{total} open role{total === 1 ? "" : "s"} on WorkBridge.</p>

      <div className="mt-6">
        <JobFilters params={params} />
      </div>

      {jobs.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">
          No jobs match your search. Try adjusting your filters.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={toJobCardData(job)} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
    </Container>
  );
}
