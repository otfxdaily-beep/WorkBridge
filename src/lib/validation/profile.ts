import { z } from "zod";

/** Empty-string form fields (e.g. an untouched <select> or number input) should mean "not set". */
function optionalField<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
}

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  phone: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().min(1, "Country is required."),
  state: z.string().trim().min(1, "State is required."),
  city: z.string().trim().min(1, "City is required."),
  area: z.string().trim().optional().or(z.literal("")),
});

export const professionalInfoSchema = z.object({
  professionalTitle: z.string().trim().max(150).optional().or(z.literal("")),
  aboutMe: z.string().trim().max(2000).optional().or(z.literal("")),
  yearsOfExperience: optionalField(z.coerce.number().int().min(0).max(60)),
  currentEmploymentStatus: optionalField(z.enum(["EMPLOYED", "UNEMPLOYED", "FREELANCER", "STUDENT"])),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Enter a skill.").max(60),
  level: optionalField(z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])),
});

export const experienceSchema = z
  .object({
    jobTitle: z.string().trim().min(1, "Job title is required."),
    company: z.string().trim().min(1, "Company is required."),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().optional().or(z.literal("")),
    isCurrent: z.coerce.boolean().optional(),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((data) => data.isCurrent || data.endDate, {
    error: "Add an end date, or mark this as your current role.",
    path: ["endDate"],
  });

export const educationSchema = z.object({
  institution: z.string().trim().min(1, "Institution is required."),
  qualification: z.string().trim().min(1, "Qualification is required."),
  field: z.string().trim().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional().or(z.literal("")),
});

export const preferencesSchema = z.object({
  desiredJobTitle: z.string().trim().max(150).optional().or(z.literal("")),
  country: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  minSalary: optionalField(z.coerce.number().int().min(0)),
  maxSalary: optionalField(z.coerce.number().int().min(0)),
  employmentType: optionalField(z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"])),
  workArrangement: optionalField(z.enum(["ON_SITE", "HYBRID", "REMOTE"])),
  availability: optionalField(z.enum(["IMMEDIATE", "TWO_WEEKS", "ONE_MONTH", "NEGOTIABLE"])),
});
