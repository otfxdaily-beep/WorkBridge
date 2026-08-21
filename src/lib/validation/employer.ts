import { z } from "zod";

function optionalField<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
}

export const employerPersonalInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  jobTitle: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
});

export const companyProfileSchema = z.object({
  name: z.string().trim().min(2, "Company name is required."),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  industry: z.string().trim().max(150).optional().or(z.literal("")),
  website: z.string().trim().optional().or(z.literal("")),
  email: z.email("Enter a valid company email.").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().min(1, "Country is required."),
  state: z.string().trim().min(1, "State is required."),
  city: z.string().trim().min(1, "City is required."),
  area: z.string().trim().optional().or(z.literal("")),
  employeeCount: optionalField(z.enum(["1-10", "11-50", "51-200", "201-500", "500+"])),
  yearEstablished: optionalField(z.coerce.number().int().min(1900).max(new Date().getFullYear())),
});
