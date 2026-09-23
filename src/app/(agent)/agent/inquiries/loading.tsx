export default function AgentInquiriesLoading() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-6 border-b border-divider">
        <div className="h-4 w-32 rounded bg-divider/40" />
        <div className="h-8 w-60 rounded-lg bg-divider/50" />
        <div className="h-4 w-96 rounded bg-divider/40" />
        <div className="flex gap-3 pt-2">
          <div className="h-7 w-28 rounded-lg bg-divider/30" />
          <div className="h-7 w-20 rounded-lg bg-divider/30" />
          <div className="h-7 w-24 rounded-lg bg-divider/30" />
        </div>
      </div>

      {/* List Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-divider bg-surface p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-divider/60">
              <div className="flex items-center gap-3">
                <div className="h-14 w-20 rounded-lg bg-divider/40" />
                <div className="space-y-2">
                  <div className="h-5 w-48 rounded bg-divider/50" />
                  <div className="h-3 w-32 rounded bg-divider/40" />
                </div>
              </div>
              <div className="h-4 w-24 rounded bg-divider/30" />
            </div>
            <div className="h-16 rounded-xl bg-divider/20" />
            <div className="flex justify-between pt-3 border-t border-divider/60">
              <div className="h-6 w-24 rounded-full bg-divider/30" />
              <div className="h-8 w-36 rounded-md bg-divider/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
