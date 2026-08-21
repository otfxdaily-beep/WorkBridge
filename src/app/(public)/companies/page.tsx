import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Companies" };

export default function CompaniesPage() {
  return (
    <ComingSoon
      stage="Coming in Stage 6"
      title="Company directory"
      description="Verified employer profiles will be listed here once Employer Onboarding is built."
    />
  );
}
