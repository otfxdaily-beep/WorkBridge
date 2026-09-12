import { describe, expect, it } from "vitest";
import { jobReportSchema } from "./report";

describe("jobReportSchema", () => {
  it("accepts a valid reason with a description", () => {
    const result = jobReportSchema.safeParse({ reason: "SCAM", description: "This looks like a scam listing." });
    expect(result.success).toBe(true);
  });

  it("accepts a valid reason with no description", () => {
    expect(jobReportSchema.safeParse({ reason: "FAKE_JOB" }).success).toBe(true);
  });

  it("accepts an empty-string description (from an untouched textarea)", () => {
    expect(jobReportSchema.safeParse({ reason: "OTHER", description: "" }).success).toBe(true);
  });

  it("rejects a reason outside the job-report enum", () => {
    // HARASSMENT is a valid ReportReason for conversations but not for jobs.
    expect(jobReportSchema.safeParse({ reason: "HARASSMENT" }).success).toBe(false);
  });

  it("rejects a missing reason", () => {
    expect(jobReportSchema.safeParse({ description: "No reason given." }).success).toBe(false);
  });

  it("rejects a description over 1000 characters", () => {
    const result = jobReportSchema.safeParse({ reason: "OTHER", description: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });
});
