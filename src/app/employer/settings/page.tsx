import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PersonalInfoForm } from "./personal-info-form";
import { PhotoForm } from "./photo-form";

export const metadata: Metadata = { title: "Settings" };

export default async function EmployerSettingsPage() {
  const user = await requireRole("EMPLOYER");
  const profile = await prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  return (
    <Container className="max-w-3xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">Your personal details as a recruiter on WorkBridge.</p>
      </div>

      <PersonalInfoForm
        fullName={profile.fullName}
        jobTitle={profile.jobTitle ?? ""}
        phone={profile.phone ?? ""}
        email={user.email}
      />

      <PhotoForm photoUrl={profile.photoUrl} />
    </Container>
  );
}
