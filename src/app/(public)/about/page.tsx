import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "About",
  description: "WorkBridge is building a trusted employment marketplace for Nigeria, starting in Abuja.",
};

export default function AboutPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          About WorkBridge
        </h1>
        <p className="mt-6 text-slate-600">
          WorkBridge is an employment marketplace built for Nigeria, starting
          in Abuja. We believe finding work &mdash; and finding the right
          person for a role &mdash; should be simple, transparent and safe.
        </p>
        <p className="mt-4 text-slate-600">
          Too many job seekers lose time and money to fake vacancies and
          recruitment scams. WorkBridge is designed around trust from day
          one: employer verification, in-platform messaging that never
          exposes your phone number by default, and a straightforward way to
          report anything suspicious.
        </p>
        <p className="mt-4 text-slate-600">
          We&apos;re starting in Abuja, but WorkBridge is built to grow with
          Nigeria &mdash; more cities, and eventually more countries.
        </p>
      </div>
    </Container>
  );
}
