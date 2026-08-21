import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import type { JobCardData } from "@/types";
import { ArrowRight } from "lucide-react";

export function FeaturedJobs({ jobs }: { jobs: JobCardData[] }) {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Featured jobs
            </h2>
            <p className="mt-2 text-slate-600">
              A sample of open roles from employers on WorkBridge.
            </p>
          </div>
          <ButtonLink href="/jobs" variant="ghost" size="sm">
            View all jobs
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </Container>
    </section>
  );
}
