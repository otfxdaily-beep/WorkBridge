"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { findOrCreateLocation } from "@/lib/location";
import { validateFile, saveUploadedFile, CV_RULE, PHOTO_RULE } from "@/lib/uploads";
import {
  personalInfoSchema,
  professionalInfoSchema,
  skillSchema,
  experienceSchema,
  educationSchema,
  preferencesSchema,
} from "@/lib/validation/profile";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

const PROFILE_PATH = "/dashboard/profile";

async function requireProfile() {
  const user = await requireRole("JOB_SEEKER");
  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { userId: user.id } });
  return profile;
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function updatePersonalInfoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const parsed = personalInfoSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { fullName, phone, country, state, city, area } = parsed.data;
  const location = await findOrCreateLocation({ country, state, city, area });

  await prisma.jobSeekerProfile.update({
    where: { id: profile.id },
    data: { fullName, phone: phone || null, locationId: location.id, area: area || null },
  });

  revalidatePath(PROFILE_PATH);
  return { success: "Personal information updated." };
}

export async function updateProfessionalInfoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const parsed = professionalInfoSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { professionalTitle, aboutMe, yearsOfExperience, currentEmploymentStatus } = parsed.data;

  await prisma.jobSeekerProfile.update({
    where: { id: profile.id },
    data: {
      professionalTitle: professionalTitle || null,
      aboutMe: aboutMe || null,
      yearsOfExperience: yearsOfExperience ?? null,
      currentEmploymentStatus: currentEmploymentStatus || null,
    },
  });

  revalidatePath(PROFILE_PATH);
  return { success: "Professional information updated." };
}

export async function uploadPhotoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const file = formData.get("photo") as File | null;

  if (!file) return { error: "Choose a photo to upload." };
  const validationError = validateFile(file, PHOTO_RULE);
  if (validationError) return { error: validationError };

  const saved = await saveUploadedFile(file, "photos");
  await prisma.jobSeekerProfile.update({ where: { id: profile.id }, data: { photoUrl: saved.url } });

  revalidatePath(PROFILE_PATH);
  return { success: "Profile photo updated." };
}

export async function uploadCvAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const file = formData.get("cv") as File | null;

  if (!file) return { error: "Choose a file to upload." };
  const validationError = validateFile(file, CV_RULE);
  if (validationError) return { error: validationError };

  const saved = await saveUploadedFile(file, "cv");
  await prisma.jobSeekerProfile.update({
    where: { id: profile.id },
    data: {
      cvUrl: saved.url,
      cvOriginalName: saved.originalName,
      cvMimeType: saved.mimeType,
      cvSizeBytes: saved.size,
    },
  });

  revalidatePath(PROFILE_PATH);
  return { success: "CV uploaded." };
}

export async function addSkillAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const parsed = skillSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid skill name." };

  const { name, level } = parsed.data;

  const skill = await prisma.skill.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  const already = await prisma.jobSeekerSkill.findUnique({
    where: { jobSeekerProfileId_skillId: { jobSeekerProfileId: profile.id, skillId: skill.id } },
  });
  if (already) return { error: "You've already added that skill." };

  await prisma.jobSeekerSkill.create({
    data: { jobSeekerProfileId: profile.id, skillId: skill.id, level: level || null },
  });

  revalidatePath(PROFILE_PATH);
  return { success: "Skill added." };
}

export async function removeSkillAction(jobSeekerSkillId: string) {
  const profile = await requireProfile();
  await prisma.jobSeekerSkill.deleteMany({ where: { id: jobSeekerSkillId, jobSeekerProfileId: profile.id } });
  revalidatePath(PROFILE_PATH);
}

export async function addExperienceAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const raw = Object.fromEntries(formData);
  const parsed = experienceSchema.safeParse({ ...raw, isCurrent: formData.get("isCurrent") === "on" });

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { jobTitle, company, startDate, endDate, isCurrent, description } = parsed.data;

  await prisma.experience.create({
    data: {
      jobSeekerProfileId: profile.id,
      jobTitle,
      company,
      startDate: toDate(startDate),
      endDate: isCurrent || !endDate ? null : toDate(endDate),
      isCurrent: Boolean(isCurrent),
      description: description || null,
    },
  });

  revalidatePath(PROFILE_PATH);
  return { success: "Experience added." };
}

export async function deleteExperienceAction(experienceId: string) {
  const profile = await requireProfile();
  await prisma.experience.deleteMany({ where: { id: experienceId, jobSeekerProfileId: profile.id } });
  revalidatePath(PROFILE_PATH);
}

export async function addEducationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const parsed = educationSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { institution, qualification, field, startDate, endDate } = parsed.data;

  await prisma.education.create({
    data: {
      jobSeekerProfileId: profile.id,
      institution,
      qualification,
      field: field || null,
      startDate: toDate(startDate),
      endDate: endDate ? toDate(endDate) : null,
    },
  });

  revalidatePath(PROFILE_PATH);
  return { success: "Education added." };
}

export async function deleteEducationAction(educationId: string) {
  const profile = await requireProfile();
  await prisma.education.deleteMany({ where: { id: educationId, jobSeekerProfileId: profile.id } });
  revalidatePath(PROFILE_PATH);
}

export async function updatePreferencesAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireProfile();
  const parsed = preferencesSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { desiredJobTitle, country, state, city, minSalary, maxSalary, employmentType, workArrangement, availability } =
    parsed.data;

  const location = country && state && city ? await findOrCreateLocation({ country, state, city }) : null;

  await prisma.jobPreference.upsert({
    where: { jobSeekerProfileId: profile.id },
    update: {
      desiredJobTitle: desiredJobTitle || null,
      locationId: location?.id ?? null,
      minSalary: minSalary ?? null,
      maxSalary: maxSalary ?? null,
      employmentType: employmentType || null,
      workArrangement: workArrangement || null,
      availability: availability || null,
    },
    create: {
      jobSeekerProfileId: profile.id,
      desiredJobTitle: desiredJobTitle || null,
      locationId: location?.id ?? null,
      minSalary: minSalary ?? null,
      maxSalary: maxSalary ?? null,
      employmentType: employmentType || null,
      workArrangement: workArrangement || null,
      availability: availability || null,
    },
  });

  revalidatePath(PROFILE_PATH);
  return { success: "Preferences updated." };
}
