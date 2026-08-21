"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { findOrCreateLocation } from "@/lib/location";
import { validateFile, saveUploadedFile, PHOTO_RULE, VERIFICATION_DOCUMENT_RULE } from "@/lib/uploads";
import { companyProfileSchema } from "@/lib/validation/employer";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

const COMPANY_PATH = "/employer/company";

async function requireEmployerProfile() {
  const user = await requireRole("EMPLOYER");
  const profile = await prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });
  return profile;
}

export async function updateCompanyAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const employerProfile = await requireEmployerProfile();
  const parsed = companyProfileSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, description, industry, website, email, phone, country, state, city, area, employeeCount, yearEstablished } =
    parsed.data;
  const location = await findOrCreateLocation({ country, state, city, area });

  const data = {
    name,
    description: description || null,
    industry: industry || null,
    website: website || null,
    email: email || null,
    phone: phone || null,
    locationId: location.id,
    area: area || null,
    employeeCount: employeeCount || null,
    yearEstablished: yearEstablished ?? null,
  };

  if (employerProfile.companyId) {
    await prisma.company.update({ where: { id: employerProfile.companyId }, data });
  } else {
    const company = await prisma.company.create({ data });
    await prisma.employerProfile.update({
      where: { id: employerProfile.id },
      data: { companyId: company.id },
    });
  }

  revalidatePath(COMPANY_PATH);
  return { success: "Company profile saved." };
}

export async function uploadLogoAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const employerProfile = await requireEmployerProfile();
  if (!employerProfile.companyId) return { error: "Save your company profile first." };

  const file = formData.get("logo") as File | null;
  if (!file) return { error: "Choose a logo to upload." };
  const validationError = validateFile(file, PHOTO_RULE);
  if (validationError) return { error: validationError };

  const saved = await saveUploadedFile(file, "logos");
  await prisma.company.update({ where: { id: employerProfile.companyId }, data: { logoUrl: saved.url } });

  revalidatePath(COMPANY_PATH);
  return { success: "Logo updated." };
}

export async function requestVerificationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const employerProfile = await requireEmployerProfile();
  if (!employerProfile.companyId) return { error: "Save your company profile before requesting verification." };

  const company = await prisma.company.findUniqueOrThrow({ where: { id: employerProfile.companyId } });
  if (company.verificationStatus === "PENDING") return { error: "Your verification request is already pending review." };
  if (company.verificationStatus === "VERIFIED") return { error: "Your company is already verified." };

  const file = formData.get("document") as File | null;
  let documentUrl: string | undefined;

  if (file && file.size > 0) {
    const validationError = validateFile(file, VERIFICATION_DOCUMENT_RULE);
    if (validationError) return { error: validationError };
    const saved = await saveUploadedFile(file, "verification");
    documentUrl = saved.url;
  }

  await prisma.$transaction([
    prisma.verification.create({
      data: { companyId: company.id, status: "PENDING", documentUrl },
    }),
    prisma.company.update({ where: { id: company.id }, data: { verificationStatus: "PENDING" } }),
  ]);

  revalidatePath(COMPANY_PATH);
  return { success: "Verification requested. Our team will review your company shortly." };
}
