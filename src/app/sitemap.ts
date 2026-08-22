import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.APP_URL ?? "http://localhost:3000";

const STATIC_ROUTES = ["/", "/jobs", "/companies", "/about", "/for-employers", "/for-job-seekers"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  return [
    ...STATIC_ROUTES.map((route) => ({ url: `${BASE_URL}${route}`, lastModified: new Date() })),
    ...jobs.map((job) => ({ url: `${BASE_URL}/jobs/${job.slug}`, lastModified: job.updatedAt })),
  ];
}
