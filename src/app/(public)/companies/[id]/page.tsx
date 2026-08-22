import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, MapPin, Star, Globe } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/job-card";
import { prisma } from "@/lib/prisma";
import { getCompanyRating, toJobCardData } from "@/lib/jobs";

async function getCompany(id: string) {
  return prisma.company.findUnique({ where: { id }, include: { location: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return { title: "Company not found" };
  return {
    title: company.name,
    description: company.description ?? `${company.name} on WorkBridge.`,
  };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [rating, jobs] = await Promise.all([
    getCompanyRating(company.id),
    prisma.job.findMany({
      where: { companyId: company.id, status: "PUBLISHED" },
      include: { company: true, location: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return (
    <Container className="max-w-4xl py-10">
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} className="size-16 rounded-xl object-cover" />
            ) : (
              <Building2 className="size-8" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">{company.name}</h1>
            <p className="mt-0.5 text-slate-600">{company.industry ?? "Company"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {company.verificationStatus === "VERIFIED" && <VerifiedBadge />}
              {rating.average && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {rating.average.toFixed(1)} ({rating.count} review{rating.count === 1 ? "" : "s"})
                </span>
              )}
              {company.location && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="size-3.5" />
                  {company.location.city}, {company.location.state}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
                >
                  <Globe className="size-3.5" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {company.description && <p className="mt-5 whitespace-pre-wrap text-sm text-slate-600">{company.description}</p>}
      </Card>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Open roles ({jobs.length})
      </h2>
      {jobs.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No open roles right now.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={toJobCardData(job)} />
          ))}
        </div>
      )}
    </Container>
  );
}
