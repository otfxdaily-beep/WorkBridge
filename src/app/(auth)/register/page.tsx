import type { Metadata } from "next";
import { RolePicker } from "./role-picker";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const { as } = await searchParams;
  const role = as === "job-seeker" ? "JOB_SEEKER" : as === "employer" ? "EMPLOYER" : null;

  if (!role) return <RolePicker />;
  return <RegisterForm role={role} />;
}
