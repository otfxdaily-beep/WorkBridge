import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/container";

const columns = [
  {
    title: "For Job Seekers",
    links: [
      { href: "/jobs", label: "Browse Jobs" },
      { href: "/register?as=job-seeker", label: "Create Profile" },
      { href: "/for-job-seekers", label: "How It Works" },
    ],
  },
  {
    title: "For Employers",
    links: [
      { href: "/register?as=employer", label: "Post a Job" },
      { href: "/for-employers", label: "Why WorkBridge" },
      { href: "/companies", label: "Browse Companies" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/trust-and-safety", label: "Trust & Safety" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Connecting talent with opportunity, starting in Abuja.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} WorkBridge. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">Made for the Nigerian job market.</p>
        </div>
      </Container>
    </footer>
  );
}
