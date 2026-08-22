import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { JobForm } from "../../job-form";
import { updateJobAction } from "../../actions";
import { JobSkillsSection } from "./job-skills-section";

export const metadata: Metadata = { title: "Edit Job" };

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("EMPLOYER");
  const employerProfile = await prisma.employerProfile.findUniqueOrThrow({ where: { userId: user.id } });

  const job = await prisma.job.findUnique({
    where: { id },
    include: { location: true, skills: { include: { skill: true } } },
  });

  if (!job) notFound();
  if (job.companyId !== employerProfile.companyId) redirect("/employer/jobs");

  const boundUpdate = updateJobAction.bind(null, job.id);

  return (
    <Container className="max-w-3xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit job</h1>
        <p className="mt-1 text-slate-600">{job.title}</p>
      </div>

      <JobSkillsSection
        jobId={job.id}
        skills={job.skills.map((s) => ({ id: s.id, name: s.skill.name }))}
      />

      <JobForm
        categories={await prisma.jobCategory.findMany({ orderBy: { name: "asc" } })}
        initialValues={{
          title: job.title,
          categoryId: job.categoryId,
          description: job.description,
          responsibilities: job.responsibilities ?? "",
          requirements: job.requirements ?? "",
          benefits: job.benefits ?? "",
          country: job.location.country,
          state: job.location.state,
          city: job.location.city,
          area: job.area ?? "",
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryFrequency: job.salaryFrequency,
          employmentType: job.employmentType,
          workArrangement: job.workArrangement,
          experienceLevel: job.experienceLevel,
          numberOfOpenings: job.numberOfOpenings,
          deadline: job.deadline ? job.deadline.toISOString().slice(0, 10) : "",
        }}
        action={boundUpdate}
        submitLabel="Continue to review"
      />
    </Container>
  );
}
