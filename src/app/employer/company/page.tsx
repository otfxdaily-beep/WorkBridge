import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { CompanyInfoForm } from "./company-info-form";
import { LogoForm } from "./logo-form";
import { VerificationPanel } from "./verification-panel";

export const metadata: Metadata = { title: "Company" };

export default async function EmployerCompanyPage() {
  const user = await requireRole("EMPLOYER");
  const employerProfile = await prisma.employerProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: { company: { include: { location: true } } },
  });

  const company = employerProfile.company;
  const latestVerification = company
    ? await prisma.verification.findFirst({
        where: { companyId: company.id },
        orderBy: { submittedAt: "desc" },
      })
    : null;

  return (
    <Container className="max-w-3xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Company profile</h1>
        <p className="mt-1 text-slate-600">
          This is what job seekers see on your job posts and company page.
        </p>
      </div>

      <CompanyInfoForm
        name={company?.name ?? ""}
        description={company?.description ?? ""}
        industry={company?.industry ?? ""}
        website={company?.website ?? ""}
        email={company?.email ?? ""}
        phone={company?.phone ?? ""}
        country={company?.location?.country ?? ""}
        state={company?.location?.state ?? ""}
        city={company?.location?.city ?? ""}
        area={company?.area ?? ""}
        employeeCount={company?.employeeCount ?? null}
        yearEstablished={company?.yearEstablished ?? null}
      />

      {company && <LogoForm logoUrl={company.logoUrl} />}

      <VerificationPanel
        status={company?.verificationStatus ?? "NOT_VERIFIED"}
        hasCompany={Boolean(company)}
        rejectionReason={latestVerification?.rejectionReason}
      />
    </Container>
  );
}
