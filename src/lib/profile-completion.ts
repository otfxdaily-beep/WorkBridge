import type {
  JobSeekerProfile,
  Experience,
  Education,
  JobPreference,
} from "@/generated/prisma/client";

export type JobSeekerProfileForCompletion = JobSeekerProfile & {
  skills: unknown[];
  experiences: Experience[];
  educations: Education[];
  preference: JobPreference | null;
};

const CHECKS: Array<{ weight: number; test: (p: JobSeekerProfileForCompletion) => boolean }> = [
  { weight: 10, test: (p) => Boolean(p.fullName) },
  { weight: 10, test: (p) => Boolean(p.photoUrl) },
  { weight: 5, test: (p) => Boolean(p.phone) },
  { weight: 10, test: (p) => Boolean(p.locationId) },
  { weight: 10, test: (p) => Boolean(p.professionalTitle) },
  { weight: 10, test: (p) => Boolean(p.aboutMe) },
  { weight: 15, test: (p) => p.skills.length > 0 },
  { weight: 10, test: (p) => p.experiences.length > 0 },
  { weight: 10, test: (p) => p.educations.length > 0 },
  { weight: 5, test: (p) => Boolean(p.preference) },
  { weight: 15, test: (p) => Boolean(p.cvUrl) },
];

const TOTAL_WEIGHT = CHECKS.reduce((sum, c) => sum + c.weight, 0);

export function calculateProfileCompletion(profile: JobSeekerProfileForCompletion): number {
  const earned = CHECKS.reduce((sum, c) => sum + (c.test(profile) ? c.weight : 0), 0);
  return Math.round((earned / TOTAL_WEIGHT) * 100);
}
