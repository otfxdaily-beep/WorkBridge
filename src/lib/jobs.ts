import "server-only";
import type { Prisma, EmploymentType, WorkArrangement, ExperienceLevel } from "@/generated/prisma/client";
import type { JobCardData } from "@/types";
import { prisma } from "@/lib/prisma";

export const JOBS_PAGE_SIZE = 9;

export type JobSearchParams = {
  q?: string;
  location?: string;
  minSalary?: string;
  employmentType?: string;
  workArrangement?: string;
  experienceLevel?: string;
  datePosted?: string;
  verifiedOnly?: string;
  sort?: string;
  page?: string;
};

export function buildJobWhere(params: JobSearchParams): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };
  const and: Prisma.JobWhereInput[] = [];

  if (params.q?.trim()) {
    const q = params.q.trim();
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
        { skills: { some: { skill: { name: { contains: q, mode: "insensitive" } } } } },
      ],
    });
  }

  if (params.location) {
    and.push({ locationId: params.location });
  }

  if (params.minSalary) {
    const min = Number(params.minSalary);
    if (!Number.isNaN(min) && min > 0) {
      and.push({ OR: [{ salaryMax: { gte: min } }, { salaryMax: null, salaryMin: { gte: min } }] });
    }
  }

  if (params.employmentType) {
    and.push({ employmentType: params.employmentType as EmploymentType });
  }
  if (params.workArrangement) {
    and.push({ workArrangement: params.workArrangement as WorkArrangement });
  }
  if (params.experienceLevel) {
    and.push({ experienceLevel: params.experienceLevel as ExperienceLevel });
  }

  if (params.datePosted) {
    const days = { "24h": 1, "7d": 7, "30d": 30 }[params.datePosted];
    if (days) {
      and.push({ publishedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } });
    }
  }

  if (params.verifiedOnly === "on") {
    and.push({ company: { verificationStatus: "VERIFIED" } });
  }

  if (and.length > 0) where.AND = and;
  return where;
}

export function buildJobOrderBy(sort?: string): Prisma.JobOrderByWithRelationInput[] {
  switch (sort) {
    case "salary_high":
      return [{ salaryMax: "desc" }, { createdAt: "desc" }];
    case "salary_low":
      return [{ salaryMin: "asc" }, { createdAt: "desc" }];
    case "newest":
    case "relevance": // No full-text ranking yet; relevance falls back to newest until Stage 13 (Matching).
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

type JobWithRelations = Prisma.JobGetPayload<{
  include: { company: true; location: true };
}>;

/** Rating is an average of approved Reviews left for any recruiter at the company. */
export async function getCompanyRating(companyId: string) {
  const recruiters = await prisma.employerProfile.findMany({ where: { companyId }, select: { userId: true } });
  if (recruiters.length === 0) return { average: null, count: 0 };

  const result = await prisma.review.aggregate({
    where: { revieweeId: { in: recruiters.map((r) => r.userId) }, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });

  return { average: result._avg.rating, count: result._count };
}

export function toJobCardData(job: JobWithRelations): JobCardData {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    companyName: job.company.name,
    companyLogoUrl: job.company.logoUrl,
    isVerified: job.company.verificationStatus === "VERIFIED",
    city: job.location.city,
    state: job.location.state,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryFrequency: job.salaryFrequency,
    employmentType: job.employmentType,
    matchScore: null,
    postedAt: (job.publishedAt ?? job.createdAt).toISOString(),
  };
}
