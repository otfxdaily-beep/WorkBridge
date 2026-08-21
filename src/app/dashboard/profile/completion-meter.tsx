import { Card } from "@/components/ui/card";

export function CompletionMeter({ percent }: { percent: number }) {
  const tone = percent >= 80 ? "bg-accent-600" : percent >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Profile completion</h2>
        <span className="text-sm font-semibold text-slate-900">{percent}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {percent >= 100
          ? "Your profile is complete."
          : "Add a photo, skills, experience, education and a CV to reach 100%."}
      </p>
    </Card>
  );
}
