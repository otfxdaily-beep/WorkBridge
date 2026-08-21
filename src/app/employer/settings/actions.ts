"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { validateFile, saveUploadedFile, PHOTO_RULE } from "@/lib/uploads";
import { employerPersonalInfoSchema } from "@/lib/validation/employer";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

const SETTINGS_PATH = "/employer/settings";

async function requireEmployerProfile() {
  const user = await requireRole("EMPLOYER");
  return prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });
}

export async function updateEmployerPersonalInfoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireEmployerProfile();
  const parsed = employerPersonalInfoSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { fullName, jobTitle, phone } = parsed.data;
  await prisma.employerProfile.update({
    where: { id: profile.id },
    data: { fullName, jobTitle: jobTitle || null, phone: phone || null },
  });

  revalidatePath(SETTINGS_PATH);
  return { success: "Personal information updated." };
}

export async function uploadEmployerPhotoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireEmployerProfile();
  const file = formData.get("photo") as File | null;

  if (!file) return { error: "Choose a photo to upload." };
  const validationError = validateFile(file, PHOTO_RULE);
  if (validationError) return { error: validationError };

  const saved = await saveUploadedFile(file, "photos");
  await prisma.employerProfile.update({ where: { id: profile.id }, data: { photoUrl: saved.url } });

  revalidatePath(SETTINGS_PATH);
  return { success: "Photo updated." };
}
