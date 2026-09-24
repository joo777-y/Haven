export default function CollectionDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <div className="h-4 w-32 rounded bg-divider/40" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-lg bg-divider/50" />
            <div className="h-4 w-80 rounded bg-divider/40" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-divider/30" />
            <div className="h-9 w-32 rounded-lg bg-divider/30" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-7 w-24 rounded-lg bg-divider/30" />
          <div className="h-7 w-36 rounded-lg bg-divider/30" />
        </div>
      </div>

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-divider bg-surface overflow-hidden"
          >
            <div className="aspect-[4/3] w-full bg-divider/30" />
            <div className="p-5 space-y-3">
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-divider/30" />
                <div className="h-5 w-48 rounded bg-divider/50" />
              </div>
              <div className="h-8 rounded bg-divider/20" />
              <div className="flex justify-between pt-1">
                <div className="h-3 w-16 rounded bg-divider/30" />
                <div className="h-3 w-20 rounded bg-divider/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
