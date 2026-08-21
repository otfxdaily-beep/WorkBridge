import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Check } from "lucide-react";

const jobSeekerPoints = [
  "Build a professional profile with CV, skills and experience",
  "Get a transparent match score on every job",
  "Track every application on a clear status timeline",
  "Message employers safely, without sharing your number",
];

const employerPoints = [
  "Post vacancies and manage applicants in one dashboard",
  "Search and shortlist candidates by skill and experience",
  "Schedule interviews and move candidates through hiring stages",
  "Earn a Verified Employer badge job seekers can trust",
];

export function AudienceSplit() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <Container className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <h3 className="text-xl font-semibold text-slate-900">For Job Seekers</h3>
          <p className="mt-1.5 text-sm text-slate-600">
            Everything you need to find your next role in Nigeria.
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {jobSeekerPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-600" />
                {point}
              </li>
            ))}
          </ul>
          <ButtonLink href="/register?as=job-seeker" className="mt-6 self-start">
            Create your profile
          </ButtonLink>
        </Card>

        <Card className="flex flex-col">
          <h3 className="text-xl font-semibold text-slate-900">For Employers</h3>
          <p className="mt-1.5 text-sm text-slate-600">
            Reach verified, motivated candidates faster.
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {employerPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-600" />
                {point}
              </li>
            ))}
          </ul>
          <ButtonLink href="/register?as=employer" variant="secondary" className="mt-6 self-start">
            Post your first job
          </ButtonLink>
        </Card>
      </Container>
    </section>
  );
}
