import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md text-center">
      <h1 className="text-xl font-semibold text-slate-900">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">
        Full authentication arrives in Stage 3 of the build.
      </p>
      <ButtonLink href="/" variant="secondary" className="mt-6">
        Back to home
      </ButtonLink>
    </Card>
  );
}
