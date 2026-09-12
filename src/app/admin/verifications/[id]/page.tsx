import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, FileText, Globe } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import { RejectVerificationForm } from "./reject-form";
import { approveVerificationAction } from "../actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Review Verification" };

export default async function AdminVerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();

  const verification = await prisma.verification.findUnique({
    where: { id },
    include: { company: { include: { location: true, employerProfiles: { include: { user: true } } } } },
  });

  if (!verification) notFound();

  const { company } = verification;
  const isPending = verification.status === "PENDING";

  return (
    <Container className="max-w-2xl py-10">
      <Link href="/admin/verifications" className="text-sm text-brand-600 hover:underline">
        &larr; Verifications
      </Link>

      <Card className="mt-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt={company.name} className="size-14 rounded-xl object-cover" />
            ) : (
              <Building2 className="size-7" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{company.name}</h1>
            <p className="text-sm text-slate-600">{company.industry ?? "Company"}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              {company.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {company.location.city}, {company.location.state}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                >
                  <Globe className="size-3.5" />
                  Website
                </a>
              )}
              <span>{company.employeeCount ?? "Unknown"} employees</span>
              {company.yearEstablished && <span>Est. {company.yearEstablished}</span>}
            </div>
          </div>
          <Badge tone={verification.status === "PENDING" ? "warning" : verification.status === "VERIFIED" ? "success" : "danger"}>
            {titleCase(verification.status)}
          </Badge>
        </div>

        {company.description && <p className="mt-4 text-sm text-slate-600">{company.description}</p>}

        <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <p>Submitted {formatRelativeDate(verification.submittedAt)}</p>
          {verification.documentUrl ? (
            <a
              href={verification.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-brand-600 hover:underline"
            >
              <FileText className="size-4" />
              View registration document
            </a>
          ) : (
            <p className="mt-1 text-slate-400">No document was submitted with this request.</p>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Recruiters at this company</p>
          <ul className="mt-1.5 space-y-1">
            {company.employerProfiles.map((e) => (
              <li key={e.id}>
                {e.fullName} &middot; {e.user.email}
              </li>
            ))}
          </ul>
        </div>

        {verification.status === "REJECTED" && verification.rejectionReason && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Rejected: {verification.rejectionReason}
          </p>
        )}

        {isPending && (
          <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
            <form action={approveVerificationAction.bind(null, verification.id)}>
              <Button type="submit">Approve verification</Button>
            </form>
            <RejectVerificationForm verificationId={verification.id} />
          </div>
        )}
      </Card>
    </Container>
  );
}
