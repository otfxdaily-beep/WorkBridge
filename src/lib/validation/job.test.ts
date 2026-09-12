import { describe, expect, it } from "vitest";
import { jobPostSchema, jobSkillSchema } from "./job";

const validJob = {
  title: "Frontend Developer",
  categoryId: "cat_1",
  description: "Build and maintain user-facing features for our products.",
  responsibilities: "",
  requirements: "",
  benefits: "",
  country: "Nigeria",
  state: "FCT",
  city: "Abuja",
  area: "",
  salaryMin: "",
  salaryMax: "",
  salaryFrequency: "MONTHLY",
  employmentType: "FULL_TIME",
  workArrangement: "ON_SITE",
  experienceLevel: "MID",
  numberOfOpenings: "1",
  deadline: "",
};

describe("jobPostSchema", () => {
  it("accepts a fully filled-in submission", () => {
    const result = jobPostSchema.safeParse({ ...validJob, salaryMin: "350000", salaryMax: "500000" });
    expect(result.success).toBe(true);
  });

  it("coerces empty-string optional number fields to undefined instead of failing", () => {
    // Regression test for a Stage 5 bug: an untouched HTML <input> submits
    // "", which z.coerce.number().optional() rejects because "" isn't a
    // valid number and isn't `undefined` either.
    const result = jobPostSchema.safeParse(validJob);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salaryMin).toBeUndefined();
      expect(result.data.salaryMax).toBeUndefined();
    }
  });

  it("rejects a title that's too short", () => {
    const result = jobPostSchema.safeParse({ ...validJob, title: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects a description that's too short", () => {
    const result = jobPostSchema.safeParse({ ...validJob, description: "Too short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid employment type", () => {
    const result = jobPostSchema.safeParse({ ...validJob, employmentType: "FREELANCE" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative salary", () => {
    const result = jobPostSchema.safeParse({ ...validJob, salaryMin: "-1" });
    expect(result.success).toBe(false);
  });
});

describe("jobSkillSchema", () => {
  it("accepts a normal skill name", () => {
    expect(jobSkillSchema.safeParse({ name: "React" }).success).toBe(true);
  });

  it("rejects an empty skill name", () => {
    expect(jobSkillSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects a skill name over 60 characters", () => {
    expect(jobSkillSchema.safeParse({ name: "a".repeat(61) }).success).toBe(false);
  });
});
