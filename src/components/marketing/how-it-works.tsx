import { Container } from "@/components/ui/container";
import { Search, Sparkles, SendHorizontal, MessagesSquare, CalendarCheck, Handshake } from "lucide-react";

const steps = [
  { icon: Search, title: "Discover", description: "Search and filter thousands of vacancies by role, skill, salary and location." },
  { icon: Sparkles, title: "Match", description: "See a transparent match score for every job, based on your skills and preferences." },
  { icon: SendHorizontal, title: "Apply", description: "Apply in a few clicks with your WorkBridge profile and CV." },
  { icon: MessagesSquare, title: "Communicate", description: "Message employers directly on the platform, no phone numbers required." },
  { icon: CalendarCheck, title: "Interview", description: "Accept, decline or reschedule interview invitations in one place." },
  { icon: Handshake, title: "Hire", description: "Track every application from applied to hired, with full visibility." },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            How WorkBridge works
          </h2>
          <p className="mt-3 text-slate-600">
            One journey, from discovery to hire.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <step.icon className="size-5" />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
