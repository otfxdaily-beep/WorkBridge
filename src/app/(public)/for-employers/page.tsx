import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "For Employers",
  description: "Post vacancies, manage applicants and hire faster with a Verified Employer badge on WorkBridge.",
};

const steps = [
  { title: "Create a company profile", description: "Add your logo, description and details, then apply for verification." },
  { title: "Post vacancies", description: "Publish roles with salary, requirements and benefits in minutes." },
  { title: "Manage applicants", description: "Filter, shortlist, message and move candidates through hiring stages." },
  { title: "Schedule & hire", description: "Book interviews and track every hire from application to offer." },
];

export default function ForEmployersPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Hire faster with WorkBridge
        </h1>
        <p className="mt-4 text-slate-600">
          Reach motivated candidates in Abuja and manage your entire hiring
          pipeline in one dashboard.
        </p>
        <ButtonLink href="/register?as=employer" size="lg" className="mt-8">
          Post your first job
        </ButtonLink>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.title}>
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
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
