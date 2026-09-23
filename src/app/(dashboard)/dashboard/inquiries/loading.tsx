export default function UserInquiriesLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-6 border-b border-divider">
        <div className="h-4 w-32 rounded bg-divider/40" />
        <div className="h-8 w-56 rounded-lg bg-divider/50" />
        <div className="h-4 w-96 rounded bg-divider/40" />
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
              <div className="h-6 w-28 rounded-full bg-divider/30" />
            </div>
            <div className="h-14 rounded-xl bg-divider/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
