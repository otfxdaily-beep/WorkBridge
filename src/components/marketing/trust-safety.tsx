import { Container } from "@/components/ui/container";
import { ShieldCheck, MessageCircleWarning, Flag } from "lucide-react";

const points = [
  {
    icon: ShieldCheck,
    title: "Employer verification",
    description: "Companies apply for Verified Employer status, reviewed by our admin team before it appears on their jobs.",
  },
  {
    icon: MessageCircleWarning,
    title: "No fees, ever",
    description: "Legitimate employers never ask candidates to pay for a job. WorkBridge does not allow recruitment fees on the platform.",
  },
  {
    icon: Flag,
    title: "Easy reporting",
    description: "Report a fake job, scam or suspicious message in a couple of taps. Our admin team reviews every report.",
  },
];

export function TrustSafety() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Built on trust & safety
          </h2>
          <p className="mt-3 text-slate-600">
            WorkBridge is designed to keep scams and fake jobs out of the marketplace.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {points.map((point) => (
            <div key={point.title} className="rounded-2xl border border-slate-200 p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <point.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{point.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{point.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
