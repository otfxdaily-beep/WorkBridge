"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[70vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <LogoMark className="size-12 text-red-300" />
      <h1 className="mt-6 text-3xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
