"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, roleHomePath, revokeAllSessions } from "@/lib/auth/session";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
  devLinkUrl?: string;
} | null;

const isDev = process.env.NODE_ENV !== "production";

async function issueEmailVerification(userId: string, email: string) {
  const token = generateToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const verifyUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;
  await sendVerificationEmail(email, verifyUrl);
  return verifyUrl;
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { role, fullName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists.", fieldErrors: { email: ["Already registered."] } };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      ...(role === "JOB_SEEKER"
        ? { jobSeekerProfile: { create: { fullName } } }
        : { employerProfile: { create: { fullName } } }),
    },
  });

  const devLinkUrl = await issueEmailVerification(user.id, user.email);
  await createSession(user.id);

  redirect(`${roleHomePath(role)}${isDev ? `?devVerifyUrl=${encodeURIComponent(devLinkUrl)}` : ""}`);
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const genericError = "Invalid email or password.";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: genericError };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: genericError };

  if (user.status === "SUSPENDED") {
    return { error: "Your account has been suspended. Contact support for help." };
  }

  await createSession(user.id);
  redirect(roleHomePath(user.role));
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function forgotPasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = forgotPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const successMessage = "If an account exists for that email, we've sent a password reset link.";
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { success: successMessage };

  const token = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return { success: successMessage, devLinkUrl: isDev ? resetUrl : undefined };
}

export async function resetPasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = resetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { token, password } = parsed.data;
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  await revokeAllSessions(record.userId);

  redirect("/login?reset=success");
}

export async function resendVerificationAction(userId: string, email: string, redirectTo: string) {
  const devLinkUrl = await issueEmailVerification(userId, email);
  redirect(isDev ? `${redirectTo}?devVerifyUrl=${encodeURIComponent(devLinkUrl)}` : redirectTo);
}
