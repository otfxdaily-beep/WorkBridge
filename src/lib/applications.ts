import type { ApplicationStatus } from "@/generated/prisma/client";

export const applicationStatusTone: Record<ApplicationStatus, "neutral" | "brand" | "warning" | "success" | "danger"> = {
  APPLIED: "brand",
  VIEWED: "brand",
  SHORTLISTED: "warning",
  INTERVIEW: "warning",
  OFFER: "success",
  HIRED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
};

/** The employer-facing pipeline. Applicant Management moves candidates through these
 * stages; the richer scheduling UI for INTERVIEW itself lands in the Interviews stage. */
export const APPLICANT_TABS = ["ALL", "NEW", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;
export type ApplicantTab = (typeof APPLICANT_TABS)[number];

export function nextStatusAction(status: ApplicationStatus): { label: string; next: ApplicationStatus } | null {
  switch (status) {
    case "APPLIED":
    case "VIEWED":
      return { label: "Shortlist", next: "SHORTLISTED" };
    case "SHORTLISTED":
      return { label: "Move to Interview", next: "INTERVIEW" };
    case "INTERVIEW":
      return { label: "Move to Offer", next: "OFFER" };
    case "OFFER":
      return { label: "Mark Hired", next: "HIRED" };
    default:
      return null;
  }
}

export function canReject(status: ApplicationStatus) {
  return !["HIRED", "REJECTED", "WITHDRAWN"].includes(status);
}
