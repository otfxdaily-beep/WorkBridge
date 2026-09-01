/**
 * WorkBridge's job-match scoring.
 *
 * This is a plain, transparent, rule-based weighted score - NOT AI/ML. It is
 * deliberately isolated behind calculateMatch() so it can be swapped for a
 * smarter (e.g. AI-assisted) implementation later without touching any of
 * the call sites that just want { score, explanation }.
 *
 * Weights (must sum to 1): skills 40%, experience 20%, location 15%,
 * salary 10%, job title/preference 10%, employment type/work arrangement 5%.
 */
import type {
  EmploymentType,
  WorkArrangement,
  ExperienceLevel,
  Prisma,
} from "@/generated/prisma/client";

export type CandidateMatchInput = {
  skillNames: string[];
  yearsOfExperience: number | null;
  location: { city: string; state: string } | null;
  desiredJobTitle: string | null;
  preferredEmploymentType: EmploymentType | null;
  preferredWorkArrangement: WorkArrangement | null;
  preferredMinSalary: number | null;
  preferredMaxSalary: number | null;
};

export type JobMatchInput = {
  title: string;
  skillNames: string[];
  experienceLevel: ExperienceLevel;
  location: { city: string; state: string };
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  salaryMin: number | null;
  salaryMax: number | null;
};

export type MatchResult = {
  score: number;
  explanation: string;
};

const WEIGHTS = {
  skills: 0.4,
  experience: 0.2,
  location: 0.15,
  salary: 0.1,
  title: 0.1,
  type: 0.05,
};

const EXPERIENCE_LEVEL_MIN_YEARS: Record<ExperienceLevel, number> = {
  ENTRY: 0,
  MID: 2,
  SENIOR: 5,
  EXECUTIVE: 10,
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function scoreSkills(candidate: CandidateMatchInput, job: JobMatchInput) {
  if (job.skillNames.length === 0) return 1;
  const candidateSet = new Set(candidate.skillNames.map(normalize));
  const overlap = job.skillNames.filter((s) => candidateSet.has(normalize(s))).length;
  return overlap / job.skillNames.length;
}

function scoreExperience(candidate: CandidateMatchInput, job: JobMatchInput) {
  if (candidate.yearsOfExperience == null) return 0.5;
  const minYears = EXPERIENCE_LEVEL_MIN_YEARS[job.experienceLevel];
  if (minYears === 0) return 1;
  return Math.min(1, candidate.yearsOfExperience / minYears);
}

function scoreLocation(candidate: CandidateMatchInput, job: JobMatchInput) {
  if (job.workArrangement === "REMOTE") return 1;
  if (!candidate.location) return 0.5;
  if (normalize(candidate.location.city) === normalize(job.location.city)) return 1;
  if (normalize(candidate.location.state) === normalize(job.location.state)) return 0.6;
  return 0.2;
}

function scoreSalary(candidate: CandidateMatchInput, job: JobMatchInput) {
  const candidateMin = candidate.preferredMinSalary;
  if (candidateMin == null || (job.salaryMin == null && job.salaryMax == null)) return 0.5;
  const jobMax = job.salaryMax ?? job.salaryMin ?? 0;
  if (jobMax >= candidateMin) return 1;
  const shortfall = (candidateMin - jobMax) / candidateMin;
  return shortfall < 0.2 ? 0.5 : 0.2;
}

function scoreTitle(candidate: CandidateMatchInput, job: JobMatchInput) {
  if (!candidate.desiredJobTitle) return 0.5;
  const desired = normalize(candidate.desiredJobTitle);
  const actual = normalize(job.title);
  if (desired === actual) return 1;

  const desiredWords = new Set(desired.split(/\s+/).filter((w) => w.length > 2));
  const actualWords = actual.split(/\s+/).filter((w) => w.length > 2);
  const sharedWords = actualWords.filter((w) => desiredWords.has(w)).length;
  if (sharedWords === 0) return 0.3;
  return 0.7;
}

function scoreType(candidate: CandidateMatchInput, job: JobMatchInput) {
  const checks: boolean[] = [];
  if (candidate.preferredEmploymentType) checks.push(candidate.preferredEmploymentType === job.employmentType);
  if (candidate.preferredWorkArrangement) checks.push(candidate.preferredWorkArrangement === job.workArrangement);
  if (checks.length === 0) return 0.5;
  return checks.filter(Boolean).length / checks.length;
}

function buildExplanation(parts: { label: string; score: number }[]) {
  const strong = parts.filter((p) => p.score >= 0.8).map((p) => p.label);
  if (strong.length > 0) {
    const picked = strong.slice(0, 2);
    const sentence = picked.length === 2 ? `${picked[0]} and ${picked[1]}` : picked[0];
    return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
  }

  const best = [...parts].sort((a, b) => b.score - a.score)[0];
  if (best && best.score >= 0.5) {
    return `Partial match based on ${best.label.replace(/^(strong|compatible|matches) /i, "")}.`;
  }
  return "Limited overlap with this role based on your profile.";
}

export function calculateMatch(candidate: CandidateMatchInput, job: JobMatchInput): MatchResult {
  const skills = scoreSkills(candidate, job);
  const experience = scoreExperience(candidate, job);
  const location = scoreLocation(candidate, job);
  const salary = scoreSalary(candidate, job);
  const title = scoreTitle(candidate, job);
  const type = scoreType(candidate, job);

  const weighted =
    skills * WEIGHTS.skills +
    experience * WEIGHTS.experience +
    location * WEIGHTS.location +
    salary * WEIGHTS.salary +
    title * WEIGHTS.title +
    type * WEIGHTS.type;

  const explanation = buildExplanation([
    { label: "strong skills match", score: skills },
    { label: "your experience level fits", score: experience },
    { label: job.workArrangement === "REMOTE" ? "remote-friendly" : "compatible location", score: location },
    { label: "salary expectations align", score: salary },
    { label: "matches your desired role", score: title },
    { label: "matches your preferred work type", score: type },
  ]);

  return { score: Math.round(weighted * 100), explanation };
}

type ProfileWithMatchRelations = Prisma.JobSeekerProfileGetPayload<{
  include: {
    skills: { include: { skill: true } };
    location: true;
    preference: { include: { location: true } };
  };
}>;

type JobWithMatchRelations = Prisma.JobGetPayload<{
  include: { skills: { include: { skill: true } }; location: true };
}>;

export function buildCandidateMatchInput(profile: ProfileWithMatchRelations): CandidateMatchInput {
  const preferredLocation = profile.preference?.location ?? profile.location;
  return {
    skillNames: profile.skills.map((s) => s.skill.name),
    yearsOfExperience: profile.yearsOfExperience,
    location: preferredLocation ? { city: preferredLocation.city, state: preferredLocation.state } : null,
    desiredJobTitle: profile.preference?.desiredJobTitle ?? null,
    preferredEmploymentType: profile.preference?.employmentType ?? null,
    preferredWorkArrangement: profile.preference?.workArrangement ?? null,
    preferredMinSalary: profile.preference?.minSalary ?? null,
    preferredMaxSalary: profile.preference?.maxSalary ?? null,
  };
}

export function buildJobMatchInput(job: JobWithMatchRelations): JobMatchInput {
  return {
    title: job.title,
    skillNames: job.skills.map((s) => s.skill.name),
    experienceLevel: job.experienceLevel,
    location: { city: job.location.city, state: job.location.state },
    employmentType: job.employmentType,
    workArrangement: job.workArrangement,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
  };
}
