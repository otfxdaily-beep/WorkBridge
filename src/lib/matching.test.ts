import { describe, expect, it } from "vitest";
import { calculateMatch, buildCandidateMatchInput, buildJobMatchInput, type CandidateMatchInput, type JobMatchInput } from "./matching";

function candidate(overrides: Partial<CandidateMatchInput> = {}): CandidateMatchInput {
  return {
    skillNames: [],
    yearsOfExperience: null,
    location: null,
    desiredJobTitle: null,
    preferredEmploymentType: null,
    preferredWorkArrangement: null,
    preferredMinSalary: null,
    preferredMaxSalary: null,
    ...overrides,
  };
}

function job(overrides: Partial<JobMatchInput> = {}): JobMatchInput {
  return {
    title: "Frontend Developer",
    skillNames: ["React", "TypeScript"],
    experienceLevel: "MID",
    location: { city: "Abuja", state: "FCT" },
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    salaryMin: null,
    salaryMax: null,
    ...overrides,
  };
}

describe("calculateMatch", () => {
  it("scores a perfectly aligned candidate near 100", () => {
    const { score } = calculateMatch(
      candidate({
        skillNames: ["React", "TypeScript"],
        yearsOfExperience: 5,
        location: { city: "Abuja", state: "FCT" },
        desiredJobTitle: "Frontend Developer",
        preferredEmploymentType: "FULL_TIME",
        preferredWorkArrangement: "ON_SITE",
        preferredMinSalary: 300000,
      }),
      job({ salaryMin: 350000, salaryMax: 500000 })
    );
    expect(score).toBe(100);
  });

  it("scores much lower when skills and title don't overlap at all", () => {
    const { score } = calculateMatch(
      candidate({ skillNames: ["Sales", "Negotiation"], desiredJobTitle: "Sales Associate" }),
      job({ skillNames: ["React", "TypeScript"] })
    );
    expect(score).toBeLessThan(50);
  });

  it("is case-insensitive when matching skill names", () => {
    const withMatchingCase = calculateMatch(candidate({ skillNames: ["react", "typescript"] }), job());
    const withMismatchedCase = calculateMatch(candidate({ skillNames: ["REACT", "TYPESCRIPT"] }), job());
    expect(withMatchingCase.score).toBe(withMismatchedCase.score);
  });

  it("treats a job with no listed skills as a full skills match", () => {
    const { score } = calculateMatch(candidate({ skillNames: [] }), job({ skillNames: [] }));
    // skills contributes its full 40% weight regardless of candidate skills
    expect(score).toBeGreaterThanOrEqual(40);
  });

  it("gives remote jobs full location credit regardless of candidate location", () => {
    const remote = calculateMatch(candidate({ location: null }), job({ workArrangement: "REMOTE" }));
    const onSiteElsewhere = calculateMatch(
      candidate({ location: { city: "Lagos", state: "Lagos" } }),
      job({ workArrangement: "ON_SITE", location: { city: "Abuja", state: "FCT" } })
    );
    expect(remote.score).toBeGreaterThan(onSiteElsewhere.score);
  });

  it("scores same-state-different-city location lower than an exact city match", () => {
    const sameCity = calculateMatch(candidate({ location: { city: "Abuja", state: "FCT" } }), job());
    const sameStateOnly = calculateMatch(
      candidate({ location: { city: "Kuje", state: "FCT" } }),
      job({ location: { city: "Abuja", state: "FCT" } })
    );
    expect(sameStateOnly.score).toBeLessThan(sameCity.score);
  });

  it("penalizes a job whose max salary falls well short of the candidate's minimum", () => {
    const withinRange = calculateMatch(candidate({ preferredMinSalary: 300000 }), job({ salaryMin: 300000, salaryMax: 400000 }));
    const wayBelow = calculateMatch(candidate({ preferredMinSalary: 800000 }), job({ salaryMin: 300000, salaryMax: 400000 }));
    expect(wayBelow.score).toBeLessThan(withinRange.score);
  });

  it("always returns an integer 0-100 score with a non-empty explanation", () => {
    const { score, explanation } = calculateMatch(candidate(), job());
    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(explanation.length).toBeGreaterThan(0);
  });
});

describe("buildCandidateMatchInput", () => {
  it("prefers the job seeker's stated preference location over their profile location", () => {
    const input = buildCandidateMatchInput({
      skills: [{ skill: { name: "React" } }],
      yearsOfExperience: 3,
      location: { city: "Abuja", state: "FCT" },
      preference: {
        location: { city: "Lagos", state: "Lagos" },
        desiredJobTitle: "Frontend Developer",
        employmentType: "FULL_TIME",
        workArrangement: "REMOTE",
        minSalary: 400000,
        maxSalary: 600000,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(input.location).toEqual({ city: "Lagos", state: "Lagos" });
    expect(input.skillNames).toEqual(["React"]);
  });

  it("falls back to the profile location when there is no stated preference", () => {
    const input = buildCandidateMatchInput({
      skills: [],
      yearsOfExperience: null,
      location: { city: "Abuja", state: "FCT" },
      preference: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(input.location).toEqual({ city: "Abuja", state: "FCT" });
  });
});

describe("buildJobMatchInput", () => {
  it("maps job skills and location into a flat match input", () => {
    const input = buildJobMatchInput({
      title: "Backend Engineer",
      skills: [{ skill: { name: "Node.js" } }, { skill: { name: "SQL" } }],
      experienceLevel: "MID",
      location: { city: "Abuja", state: "FCT" },
      employmentType: "FULL_TIME",
      workArrangement: "HYBRID",
      salaryMin: 400000,
      salaryMax: 600000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    expect(input.skillNames).toEqual(["Node.js", "SQL"]);
    expect(input.location).toEqual({ city: "Abuja", state: "FCT" });
  });
});
