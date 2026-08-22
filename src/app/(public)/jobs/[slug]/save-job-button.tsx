import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveJobAction } from "./actions";

export function SaveJobButton({ jobId, slug, isSaved }: { jobId: string; slug: string; isSaved: boolean }) {
  const action = toggleSaveJobAction.bind(null, jobId, slug);

  return (
    <form action={action}>
      <Button type="submit" variant="secondary" className="w-full sm:w-auto">
        {isSaved ? <BookmarkCheck className="size-4 text-brand-600" /> : <Bookmark className="size-4" />}
        {isSaved ? "Saved" : "Save Job"}
      </Button>
    </form>
  );
}
