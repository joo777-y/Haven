export default function CollectionsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <div className="h-4 w-32 rounded bg-divider/40" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-60 rounded-lg bg-divider/50" />
            <div className="h-4 w-96 rounded bg-divider/40" />
          </div>
          <div className="h-9 w-36 rounded-lg bg-divider/40" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-7 w-32 rounded-lg bg-divider/30" />
          <div className="h-7 w-36 rounded-lg bg-divider/30" />
        </div>
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-divider bg-surface overflow-hidden"
          >
            <div className="aspect-[16/10] w-full bg-divider/30" />
            <div className="p-5 space-y-3">
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-divider/50" />
                <div className="h-3 w-28 rounded bg-divider/30" />
              </div>
              <div className="pt-3 border-t border-divider/60 flex justify-between">
                <div className="h-3 w-20 rounded bg-divider/30" />
                <div className="h-3 w-24 rounded bg-divider/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
