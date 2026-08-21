import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md text-center">
      <h1 className="text-xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Registration &mdash; &ldquo;I&apos;m looking for a job&rdquo; vs
        &ldquo;I&apos;m hiring&rdquo; &mdash; arrives in Stage 3 of the build.
      </p>
      <ButtonLink href="/" variant="secondary" className="mt-6">
        Back to home
      </ButtonLink>
    </Card>
  );
}
