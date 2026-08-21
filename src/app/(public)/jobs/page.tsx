import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata: Metadata = { title: "Jobs" };

export default function JobsPage() {
  return (
    <ComingSoon
      stage="Coming in Stage 8"
      title="Job search"
      description="Full search, filters and job listings will land here once the Job Posting and Job Search stages are built."
    />
  );
}
