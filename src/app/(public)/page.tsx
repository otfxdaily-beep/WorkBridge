import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { AudienceSplit } from "@/components/marketing/audience-split";
import { TrustSafety } from "@/components/marketing/trust-safety";
import { FeaturedJobs } from "@/components/marketing/featured-jobs";
import { FeaturedEmployers } from "@/components/marketing/featured-employers";
import { CtaSection } from "@/components/marketing/cta-section";
import { prisma } from "@/lib/prisma";
import { toJobCardData } from "@/lib/jobs";

export const metadata: Metadata = {
  title: { absolute: "WorkBridge | Connecting talent with opportunity" },
  description:
    "WorkBridge connects job seekers with trusted employers in Nigeria so they can discover opportunities, communicate, interview and hire in one place.",
};

export default async function HomePage() {
  const [jobs, companies] = await Promise.all([
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      include: { company: true, location: true },
      orderBy: [{ publishedAt: "desc" }],
      take: 6,
    }),
    prisma.company.findMany({
      where: { jobs: { some: { status: "PUBLISHED" } } },
      include: { location: true, _count: { select: { jobs: { where: { status: "PUBLISHED" } } } } },
      orderBy: { verificationStatus: "asc" },
      take: 4,
    }),
  ]);

  const featuredJobs = jobs.map(toJobCardData);
  const featuredCompanies = companies.map((c) => ({
    id: c.id,
    name: c.name,
    logoUrl: c.logoUrl,
    industry: c.industry,
    isVerified: c.verificationStatus === "VERIFIED",
    city: c.location?.city ?? "",
    state: c.location?.state ?? "",
    openJobs: c._count.jobs,
  }));

  return (
    <>
      <Hero />
      <HowItWorks />
      <AudienceSplit />
      <TrustSafety />
      {featuredJobs.length > 0 && <FeaturedJobs jobs={featuredJobs} />}
      {featuredCompanies.length > 0 && <FeaturedEmployers companies={featuredCompanies} />}
      <CtaSection />
    </>
  );
}
