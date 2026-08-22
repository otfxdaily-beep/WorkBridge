import { z } from "zod";

function optionalField<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
}

export const jobPostSchema = z.object({
  title: z.string().trim().min(3, "Job title is required."),
  categoryId: z.string().min(1, "Choose a category."),
  description: z.string().trim().min(20, "Add a description (at least 20 characters)."),
  responsibilities: z.string().trim().optional().or(z.literal("")),
  requirements: z.string().trim().optional().or(z.literal("")),
  benefits: z.string().trim().optional().or(z.literal("")),

  country: z.string().trim().min(1, "Country is required."),
  state: z.string().trim().min(1, "State is required."),
  city: z.string().trim().min(1, "City is required."),
  area: z.string().trim().optional().or(z.literal("")),

  salaryMin: optionalField(z.coerce.number().int().min(0)),
  salaryMax: optionalField(z.coerce.number().int().min(0)),
  salaryFrequency: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "ANNUAL"]),

  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]),
  workArrangement: z.enum(["ON_SITE", "HYBRID", "REMOTE"]),
  experienceLevel: z.enum(["ENTRY", "MID", "SENIOR", "EXECUTIVE"]),

  numberOfOpenings: z.coerce.number().int().min(1).max(999),
  deadline: z.string().optional().or(z.literal("")),
});

export const jobSkillSchema = z.object({
  name: z.string().trim().min(1, "Enter a skill.").max(60),
});
