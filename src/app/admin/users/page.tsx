import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-guards";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate, titleCase } from "@/lib/utils";
import { reactivateUserAction } from "./actions";
import { SuspendUserButton } from "./suspend-button";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Users" };

const TABS = [
  { value: "ALL", label: "All" },
  { value: "JOB_SEEKER", label: "Job seekers" },
  { value: "EMPLOYER", label: "Employers" },
  { value: "ADMIN", label: "Admins" },
  { value: "SUSPENDED", label: "Suspended" },
] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string }>;
}) {
  const admin = await requireAdmin();
  const { view, q } = await searchParams;
  const activeTab = TABS.find((t) => t.value === view)?.value ?? "ALL";

  const where: Prisma.UserWhereInput = {};
  if (activeTab === "SUSPENDED") where.status = "SUSPENDED";
  else if (activeTab !== "ALL") where.role = activeTab;
  if (q?.trim()) where.email = { contains: q.trim(), mode: "insensitive" };

  const users = await prisma.user.findMany({
    where,
    include: { jobSeekerProfile: true, employerProfile: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      <p className="mt-1 text-slate-600">Manage job seeker, employer and admin accounts.</p>

      <form action="/admin/users" className="mt-5 flex gap-2">
        {activeTab !== "ALL" && <input type="hidden" name="view" value={activeTab} />}
        <Input name="q" defaultValue={q ?? ""} placeholder="Search by email" className="max-w-xs" />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "ALL" ? "/admin/users" : `/admin/users?view=${tab.value}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {users.length === 0 ? (
        <Card className="mt-6 text-center text-sm text-slate-500">No users match this view.</Card>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((u) => {
            const name = u.jobSeekerProfile?.fullName ?? u.employerProfile?.fullName ?? null;
            return (
              <Card key={u.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{name ?? u.email}</span>
                    <Badge tone="neutral">{titleCase(u.role)}</Badge>
                    {u.status === "SUSPENDED" && <Badge tone="danger">Suspended</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{u.email}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Joined {formatRelativeDate(u.createdAt)}</p>
                </div>
                <div className="shrink-0">
                  {u.status === "SUSPENDED" ? (
                    u.id === admin.id || u.role === "ADMIN" ? null : (
                      <form action={reactivateUserAction.bind(null, u.id)}>
                        <Button type="submit" variant="secondary" size="sm">
                          Reactivate
                        </Button>
                      </form>
                    )
                  ) : u.id === admin.id || u.role === "ADMIN" ? null : (
                    <SuspendUserButton userId={u.id} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
