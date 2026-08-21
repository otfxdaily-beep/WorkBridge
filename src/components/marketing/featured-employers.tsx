import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { CompanyCard } from "@/components/companies/company-card";
import type { CompanyCardData } from "@/types";
import { ArrowRight } from "lucide-react";

export function FeaturedEmployers({ companies }: { companies: CompanyCardData[] }) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Featured employers
            </h2>
            <p className="mt-2 text-slate-600">Trusted companies hiring on WorkBridge.</p>
          </div>
          <ButtonLink href="/companies" variant="ghost" size="sm">
            View all companies
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </Container>
    </section>
  );
}
