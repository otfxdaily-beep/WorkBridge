import type { InterviewStatus, InterviewType } from "@/generated/prisma/client";

export const interviewStatusTone: Record<InterviewStatus, "neutral" | "brand" | "warning" | "success" | "danger"> = {
  PROPOSED: "brand",
  ACCEPTED: "success",
  DECLINED: "danger",
  RESCHEDULE_REQUESTED: "warning",
  COMPLETED: "neutral",
  CANCELLED: "neutral",
};

export const interviewTypeLabel: Record<InterviewType, string> = {
  IN_PERSON: "In person",
  PHONE: "Phone",
  VIDEO: "Video",
};

export function formatInterviewDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

// Nigeria (WAT) is a fixed UTC+1 offset year-round - no DST to account for.
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

/** Combines a date+time input (entered as Nigeria wall-clock time) into a UTC Date for storage. */
export function nigeriaDateTimeToUTC(date: string, time: string): Date {
  const asIfUTC = new Date(`${date}T${time}:00.000Z`);
  return new Date(asIfUTC.getTime() - LAGOS_OFFSET_MS);
}

/** Converts a stored UTC timestamp back into Nigeria wall-clock date/time strings for form inputs. */
export function utcToNigeriaDateInput(utcDate: Date): { date: string; time: string } {
  const lagos = new Date(utcDate.getTime() + LAGOS_OFFSET_MS);
  return {
    date: lagos.toISOString().slice(0, 10),
    time: lagos.toISOString().slice(11, 16),
  };
}
