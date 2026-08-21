import Link from "next/link";
import { Briefcase, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function RolePicker() {
  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-center text-2xl font-semibold text-slate-900">
        What are you looking for?
      </h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        Choose how you&apos;d like to use WorkBridge.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/register?as=job-seeker">
          <Card className="h-full transition-shadow hover:shadow-card-hover">
            <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Briefcase className="size-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">I&apos;m looking for a job</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Build a profile, search jobs and track your applications.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
              Get started <ArrowRight className="size-4" />
            </span>
          </Card>
        </Link>
        <Link href="/register?as=employer">
          <Card className="h-full transition-shadow hover:shadow-card-hover">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
              <Users className="size-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">I&apos;m hiring</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Post vacancies, manage applicants and hire candidates.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
              Get started <ArrowRight className="size-4" />
            </span>
          </Card>
        </Link>
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
