import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "For Job Seekers",
  description: "Build your profile, find matching jobs and track every application on WorkBridge.",
};

const steps = [
  { title: "Create your profile", description: "Add your skills, experience, education and CV once." },
  { title: "Search & match", description: "Filter jobs by location, salary and role, and see your match score." },
  { title: "Apply & track", description: "Apply in a click, then track your status from Applied through to Hired." },
  { title: "Message & interview", description: "Chat with employers safely and manage interview invitations." },
];

export default function ForJobSeekersPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Find your next role in Nigeria
        </h1>
        <p className="mt-4 text-slate-600">
          One profile, thousands of vacancies, a clear view of where every
          application stands.
        </p>
        <ButtonLink href="/register?as=job-seeker" size="lg" className="mt-8">
          Create your free profile
        </ButtonLink>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.title}>
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                <Check className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
