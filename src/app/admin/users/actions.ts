"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guards";
import { revokeAllSessions } from "@/lib/auth/session";

export type SuspendUserActionState = { error?: string } | null;

export async function suspendUserAction(
  userId: string,
  _prevState: SuspendUserActionState,
  formData: FormData
): Promise<SuspendUserActionState> {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "You can't suspend your own account." };

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (target.role === "ADMIN") return { error: "Admin accounts can't be suspended from here." };
  if (target.status === "SUSPENDED") return null;

  const reason = String(formData.get("reason") ?? "").trim();

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: "SUSPENDED" } }),
    prisma.adminAction.create({
      data: { adminId: admin.id, action: "SUSPEND_USER", targetType: "User", targetId: userId, note: reason || null },
    }),
  ]);
  await revokeAllSessions(userId);

  revalidatePath("/admin/users");
  return null;
}

export async function reactivateUserAction(userId: string) {
  const admin = await requireAdmin();
  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (target.status !== "SUSPENDED") return;

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } }),
    prisma.adminAction.create({
      data: { adminId: admin.id, action: "REACTIVATE_USER", targetType: "User", targetId: userId },
    }),
  ]);

  revalidatePath("/admin/users");
}
