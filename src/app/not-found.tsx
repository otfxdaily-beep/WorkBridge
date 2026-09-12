import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <LogoMark className="size-12 text-slate-300" />
      <h1 className="mt-6 text-3xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist, or may have moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/jobs" variant="secondary">
          Browse jobs
        </ButtonLink>
      </div>
    </Container>
  );
}
