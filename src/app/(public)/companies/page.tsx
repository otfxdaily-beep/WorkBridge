import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CompanyCard } from "@/components/companies/company-card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Companies",
  description: "Browse companies hiring on WorkBridge.",
};

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { jobs: { some: { status: "PUBLISHED" } } },
    include: { location: true, _count: { select: { jobs: { where: { status: "PUBLISHED" } } } } },
    orderBy: [{ verificationStatus: "asc" }, { name: "asc" }],
  });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
      <p className="mt-1 text-slate-600">
        {companies.length} compan{companies.length === 1 ? "y" : "ies"} hiring on WorkBridge.
      </p>

      {companies.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">No companies with open roles yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <CompanyCard
              key={c.id}
              company={{
                id: c.id,
                name: c.name,
                logoUrl: c.logoUrl,
                industry: c.industry,
                isVerified: c.verificationStatus === "VERIFIED",
                city: c.location?.city ?? "",
                state: c.location?.state ?? "",
                openJobs: c._count.jobs,
              }}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
