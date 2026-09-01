import { z } from "zod";

export const scheduleInterviewSchema = z.object({
  type: z.enum(["IN_PERSON", "PHONE", "VIDEO"]),
  date: z.string().min(1, "Date is required."),
  time: z.string().min(1, "Time is required."),
  locationInfo: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const interviewResponseSchema = z.object({
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
