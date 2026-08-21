import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export function ComingSoon({
  title,
  description,
  stage,
}: {
  title: string;
  description: string;
  stage: string;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
        {stage}
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 max-w-md text-slate-600">{description}</p>
      <ButtonLink href="/" variant="secondary" className="mt-8">
        Back to home
      </ButtonLink>
    </Container>
  );
}
