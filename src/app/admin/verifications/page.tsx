import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import type { VerificationStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Verifications" };

const STATUS_TONE: Record<VerificationStatus, "neutral" | "warning" | "success" | "danger"> = {
  NOT_VERIFIED: "neutral",
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};

export default async function AdminVerificationsPage() {
  await requireAdmin();

  const verifications = await prisma.verification.findMany({
    include: { company: true },
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    take: 100,
  });

  const pendingCount = verifications.filter((v) => v.status === "PENDING").length;

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Employer verifications</h1>
      <p className="mt-1 text-slate-600">
        {pendingCount} request{pendingCount === 1 ? "" : "s"} awaiting review.
      </p>

      {verifications.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">No verification requests yet.</Card>
      ) : (
        <div className="mt-6 space-y-3">
          {verifications.map((v) => (
            <Link key={v.id} href={`/admin/verifications/${v.id}`}>
              <Card className="flex flex-col gap-2 transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{v.company.name}</span>
                    <Badge tone={STATUS_TONE[v.status]}>{titleCase(v.status)}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{v.company.industry ?? "Company"}</p>
                </div>
                <p className="text-xs text-slate-400">Submitted {formatRelativeDate(v.submittedAt)}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
