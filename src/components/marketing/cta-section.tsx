import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="overflow-hidden rounded-3xl bg-brand-700 px-6 py-16 text-center sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Join job seekers and employers already connecting on WorkBridge.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/register?as=job-seeker"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto"
            >
              Find a Job
            </ButtonLink>
            <ButtonLink
              href="/register?as=employer"
              size="lg"
              className="w-full bg-white text-brand-700 hover:bg-brand-50 sm:w-auto"
            >
              I&apos;m Hiring
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
