import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { CompletionMeter } from "./completion-meter";
import { PersonalInfoForm } from "./personal-info-form";
import { ProfessionalInfoForm } from "./professional-info-form";
import { UploadsSection } from "./uploads-section";
import { SkillsSection } from "./skills-section";
import { ExperienceSection } from "./experience-section";
import { EducationSection } from "./education-section";
import { PreferencesForm } from "./preferences-form";

export const metadata: Metadata = { title: "My Profile" };

export default async function JobSeekerProfilePage() {
  const user = await requireRole("JOB_SEEKER");

  const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: {
      location: true,
      skills: { include: { skill: true }, orderBy: { skill: { name: "asc" } } },
      experiences: { orderBy: { startDate: "desc" } },
      educations: { orderBy: { startDate: "desc" } },
      preference: { include: { location: true } },
    },
  });

  const completion = calculateProfileCompletion(profile);

  return (
    <Container className="max-w-4xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My profile</h1>
        <p className="mt-1 text-slate-600">
          Keep this up to date &mdash; employers see it when you apply.
        </p>
      </div>

      <CompletionMeter percent={completion} />

      <PersonalInfoForm
        fullName={profile.fullName}
        phone={profile.phone ?? ""}
        email={user.email}
        country={profile.location?.country ?? ""}
        state={profile.location?.state ?? ""}
        city={profile.location?.city ?? ""}
        area={profile.area ?? ""}
      />

      <UploadsSection photoUrl={profile.photoUrl} cvOriginalName={profile.cvOriginalName} />

      <ProfessionalInfoForm
        professionalTitle={profile.professionalTitle ?? ""}
        aboutMe={profile.aboutMe ?? ""}
        yearsOfExperience={profile.yearsOfExperience}
        currentEmploymentStatus={profile.currentEmploymentStatus}
      />

      <SkillsSection
        skills={profile.skills.map((s) => ({ id: s.id, name: s.skill.name, level: s.level }))}
      />

      <ExperienceSection
        experiences={profile.experiences.map((e) => ({
          id: e.id,
          jobTitle: e.jobTitle,
          company: e.company,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate?.toISOString() ?? null,
          isCurrent: e.isCurrent,
          description: e.description,
        }))}
      />

      <EducationSection
        educations={profile.educations.map((e) => ({
          id: e.id,
          institution: e.institution,
          qualification: e.qualification,
          field: e.field,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate?.toISOString() ?? null,
        }))}
      />

      <PreferencesForm
        desiredJobTitle={profile.preference?.desiredJobTitle ?? ""}
        country={profile.preference?.location?.country ?? ""}
        state={profile.preference?.location?.state ?? ""}
        city={profile.preference?.location?.city ?? ""}
        minSalary={profile.preference?.minSalary ?? null}
        maxSalary={profile.preference?.maxSalary ?? null}
        employmentType={profile.preference?.employmentType ?? null}
        workArrangement={profile.preference?.workArrangement ?? null}
        availability={profile.preference?.availability ?? null}
      />
    </Container>
  );
}
