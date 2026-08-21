import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { AudienceSplit } from "@/components/marketing/audience-split";
import { TrustSafety } from "@/components/marketing/trust-safety";
import { FeaturedJobs } from "@/components/marketing/featured-jobs";
import { FeaturedEmployers } from "@/components/marketing/featured-employers";
import { CtaSection } from "@/components/marketing/cta-section";
import type { JobCardData, CompanyCardData } from "@/types";

export const metadata: Metadata = {
  title: { absolute: "WorkBridge | Connecting talent with opportunity" },
  description:
    "WorkBridge connects job seekers with trusted employers in Nigeria so they can discover opportunities, communicate, interview and hire in one place.",
};

// Placeholder data until the Job/Company stages are wired to the database (Stage 8+).
const previewJobs: JobCardData[] = [
  {
    id: "1",
    slug: "customer-success-associate-abuja",
    title: "Customer Success Associate",
    companyName: "Zenith Retail Ltd",
    isVerified: true,
    city: "Abuja",
    state: "FCT",
    salaryMin: 180000,
    salaryMax: 250000,
    salaryFrequency: "MONTHLY",
    employmentType: "FULL_TIME",
    matchScore: 92,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "2",
    slug: "frontend-developer-abuja",
    title: "Frontend Developer",
    companyName: "Northbridge Tech",
    isVerified: true,
    city: "Abuja",
    state: "FCT",
    salaryMin: 350000,
    salaryMax: 500000,
    salaryFrequency: "MONTHLY",
    employmentType: "FULL_TIME",
    matchScore: 88,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: "3",
    slug: "hr-officer-abuja",
    title: "HR Officer",
    companyName: "Maple & Finch Consulting",
    isVerified: false,
    city: "Abuja",
    state: "FCT",
    salaryMin: 220000,
    salaryMax: 280000,
    salaryFrequency: "MONTHLY",
    employmentType: "FULL_TIME",
    matchScore: 76,
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
];

const previewCompanies: CompanyCardData[] = [
  { id: "1", name: "Northbridge Tech", industry: "Technology", isVerified: true, city: "Abuja", state: "FCT", openJobs: 4 },
  { id: "2", name: "Zenith Retail Ltd", industry: "Retail", isVerified: true, city: "Abuja", state: "FCT", openJobs: 2 },
  { id: "3", name: "Maple & Finch Consulting", industry: "Consulting", isVerified: false, city: "Abuja", state: "FCT", openJobs: 1 },
  { id: "4", name: "Aso Rock Logistics", industry: "Logistics", isVerified: true, city: "Abuja", state: "FCT", openJobs: 3 },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <AudienceSplit />
      <TrustSafety />
      <FeaturedJobs jobs={previewJobs} />
      <FeaturedEmployers companies={previewCompanies} />
      <CtaSection />
    </>
  );
}
