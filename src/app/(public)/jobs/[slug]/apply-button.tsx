import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { applyToJobAction } from "./actions";

export function ApplyButton({
  jobId,
  slug,
  isLoggedIn,
  isJobSeeker,
  existingApplicationId,
  isOpen,
  hasCv,
}: {
  jobId: string;
  slug: string;
  isLoggedIn: boolean;
  isJobSeeker: boolean;
  existingApplicationId: string | null;
  isOpen: boolean;
  hasCv: boolean;
}) {
  if (existingApplicationId) {
    return (
      <ButtonLink href={`/dashboard/applications/${existingApplicationId}`} variant="secondary" className="w-full sm:w-auto">
        <CheckCircle2 className="size-4 text-accent-600" />
        Applied &middot; View status
      </ButtonLink>
    );
  }

  if (!isLoggedIn) {
    return (
      <ButtonLink href={`/login?next=/jobs/${slug}`} className="w-full sm:w-auto">
        <Send className="size-4" />
        Apply Now
      </ButtonLink>
    );
  }

  if (!isJobSeeker) {
    return (
      <Button disabled className="w-full sm:w-auto" title="Only job seeker accounts can apply">
        <Send className="size-4" />
        Apply Now
      </Button>
    );
  }

  if (!isOpen) {
    return (
      <Button disabled className="w-full sm:w-auto" title="This job is no longer accepting applications">
        <Send className="size-4" />
        Applications closed
      </Button>
    );
  }

  if (!hasCv) {
    return (
      <Button disabled className="w-full sm:w-auto" title="Add a CV to your profile before applying">
        <Send className="size-4" />
        Apply Now
      </Button>
    );
  }

  const action = applyToJobAction.bind(null, jobId, slug);

  return (
    <form action={action} className="w-full sm:w-auto">
      <Button type="submit" className="w-full sm:w-auto">
        <Send className="size-4" />
        Apply Now
      </Button>
    </form>
  );
}

export function CvRequiredNote() {
  return (
    <p className="mt-2 text-xs text-slate-500">
      Add a CV to your{" "}
      <Link href="/dashboard/profile" className="text-brand-600 hover:underline">
        profile
      </Link>{" "}
      before applying.
    </p>
  );
}
