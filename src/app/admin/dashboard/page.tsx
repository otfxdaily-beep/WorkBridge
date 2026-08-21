import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
      <p className="mt-2 max-w-lg text-slate-600">
        Platform analytics, user management, employer verification and
        report moderation will appear here once the Admin Dashboard stage is
        built.
      </p>
    </Container>
  );
}
