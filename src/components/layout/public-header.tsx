"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const navLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/for-employers", label: "For Employers" },
  { href: "/for-job-seekers", label: "For Job Seekers" },
  { href: "/about", label: "About" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Log In
          </ButtonLink>
          <ButtonLink href="/register" variant="primary" size="sm">
            Get Started
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <ButtonLink href="/login" variant="secondary" onClick={() => setOpen(false)}>
                Log In
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" onClick={() => setOpen(false)}>
                Get Started
              </ButtonLink>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
