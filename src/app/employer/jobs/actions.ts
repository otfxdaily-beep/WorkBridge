"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { findOrCreateLocation } from "@/lib/location";
import { slugify } from "@/lib/utils";
import { jobPostSchema, jobSkillSchema } from "@/lib/validation/job";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

async function requireCompany() {
  const user = await requireRole("EMPLOYER");
  const employerProfile = await prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });
  if (!employerProfile.companyId) redirect("/employer/company");
  return { user, companyId: employerProfile.companyId };
}

async function requireOwnedJob(jobId: string) {
  const { companyId } = await requireCompany();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  if (job.companyId !== companyId) redirect("/employer/jobs");
  return job;
}

async function uniqueSlug(base: string) {
  let slug = base;
  let suffix = 1;
  while (await prisma.job.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

function parseJobFields(d: z.infer<typeof jobPostSchema>) {
  return {
    title: d.title,
    categoryId: d.categoryId,
    description: d.description,
    responsibilities: d.responsibilities || null,
    requirements: d.requirements || null,
    benefits: d.benefits || null,
    salaryMin: d.salaryMin ?? null,
    salaryMax: d.salaryMax ?? null,
    salaryFrequency: d.salaryFrequency,
    employmentType: d.employmentType,
    workArrangement: d.workArrangement,
    experienceLevel: d.experienceLevel,
    numberOfOpenings: d.numberOfOpenings,
    deadline: d.deadline ? new Date(`${d.deadline}T23:59:59.000Z`) : null,
  };
}

export async function createJobAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { user, companyId } = await requireCompany();
  const parsed = jobPostSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { country, state, city, area } = parsed.data;
  const location = await findOrCreateLocation({ country, state, city, area });
  const slug = await uniqueSlug(slugify(`${parsed.data.title}-${city}`));

  const job = await prisma.job.create({
    data: {
      ...parseJobFields(parsed.data),
      companyId,
      postedById: user.id,
      locationId: location.id,
      area: area || null,
      slug,
      status: "DRAFT",
    },
  });

  redirect(`/employer/jobs/${job.id}/review`);
}

export async function updateJobAction(jobId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const job = await requireOwnedJob(jobId);
  const parsed = jobPostSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { country, state, city, area } = parsed.data;
  const location = await findOrCreateLocation({ country, state, city, area });

  await prisma.job.update({
    where: { id: job.id },
    data: {
      ...parseJobFields(parsed.data),
      locationId: location.id,
      area: area || null,
    },
  });

  redirect(`/employer/jobs/${job.id}/review`);
}

export async function publishJobAction(jobId: string) {
  const job = await requireOwnedJob(jobId);
  if (job.status !== "DRAFT" && job.status !== "REJECTED") {
    redirect(`/employer/jobs/${job.id}/review`);
  }

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "PENDING_REVIEW", rejectionReason: null },
  });

  revalidatePath("/employer/jobs");
  redirect("/employer/jobs");
}

export async function closeJobAction(jobId: string) {
  const job = await requireOwnedJob(jobId);
  await prisma.job.update({ where: { id: job.id }, data: { status: "CLOSED" } });
  revalidatePath("/employer/jobs");
}

export async function addJobSkillAction(jobId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const job = await requireOwnedJob(jobId);
  const parsed = jobSkillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid skill name." };

  const skill = await prisma.skill.upsert({
    where: { name: parsed.data.name },
    update: {},
    create: { name: parsed.data.name },
  });

  const already = await prisma.jobSkill.findUnique({
    where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
  });
  if (already) return { error: "That skill is already added." };

  await prisma.jobSkill.create({ data: { jobId: job.id, skillId: skill.id } });
  revalidatePath(`/employer/jobs/${job.id}/edit`);
  revalidatePath(`/employer/jobs/${job.id}/review`);
  return { success: "Skill added." };
}

export async function removeJobSkillAction(jobId: string, jobSkillId: string) {
  await requireOwnedJob(jobId);
  await prisma.jobSkill.deleteMany({ where: { id: jobSkillId, jobId } });
  revalidatePath(`/employer/jobs/${jobId}/edit`);
  revalidatePath(`/employer/jobs/${jobId}/review`);
}
