import { z } from "zod";

export const jobReportSchema = z.object({
  reason: z.enum([
    "FAKE_JOB",
    "SCAM",
    "MONEY_REQUEST",
    "MISLEADING_SALARY",
    "DISCRIMINATION",
    "SUSPICIOUS_BEHAVIOR",
    "OTHER",
  ]),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});
