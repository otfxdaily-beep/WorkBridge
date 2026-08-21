import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Briefcase, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 to-white">
      <Container className="relative py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
            Now live in Abuja, Nigeria
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Find the right job.
            <br />
            Find the right person.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            WorkBridge connects job seekers with trusted employers so they can
            discover opportunities, communicate, interview and hire &mdash; all
            in one place.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register?as=job-seeker" size="lg" className="w-full sm:w-auto">
              <Briefcase className="size-5" />
              Find a Job
            </ButtonLink>
            <ButtonLink
              href="/register?as=employer"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Users className="size-5" />
              I&apos;m Hiring
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
