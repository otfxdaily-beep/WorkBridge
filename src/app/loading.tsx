export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
