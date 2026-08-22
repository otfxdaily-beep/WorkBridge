import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/prisma";
import { JobForm } from "../job-form";
import { createJobAction } from "../actions";

export const metadata: Metadata = { title: "Post a Job" };

export default async function NewJobPage() {
  const categories = await prisma.jobCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <Container className="max-w-3xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Post a job</h1>
        <p className="mt-1 text-slate-600">
          Fill in the details below. You&apos;ll review everything before it&apos;s submitted.
        </p>
      </div>

      <JobForm categories={categories} action={createJobAction} submitLabel="Continue to review" />
    </Container>
  );
}
