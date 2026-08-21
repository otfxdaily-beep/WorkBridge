import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex justify-center py-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
