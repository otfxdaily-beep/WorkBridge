/**
 * Bootstraps the JobCategory lookup table. Categories are admin-curated
 * (unlike Location, which is find-or-create per user input), so this is
 * infrastructure the Job Posting flow depends on, not sample content.
 * Safe to re-run: upserts by name. Run with: npm run seed:categories
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const CATEGORIES = [
  "Sales",
  "Customer Service",
  "IT & Software Development",
  "Administration",
  "Marketing & Communications",
  "Human Resources",
  "Finance & Accounting",
  "Engineering",
  "Healthcare",
  "Education & Training",
  "Logistics & Supply Chain",
  "Hospitality & Tourism",
  "Construction & Real Estate",
  "Legal",
  "Manufacturing",
  "Retail",
  "Media & Design",
  "Agriculture",
  "Security",
  "Other",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  for (const name of CATEGORIES) {
    await prisma.jobCategory.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  console.log(`Seeded ${CATEGORIES.length} job categories.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
