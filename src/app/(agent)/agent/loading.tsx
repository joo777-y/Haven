export default function AgentLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl border border-divider bg-surface p-8 space-y-4">
        <div className="h-4 w-40 bg-divider/40 rounded-full" />
        <div className="h-8 w-72 bg-divider/40 rounded-lg" />
        <div className="h-4 w-96 bg-divider/20 rounded" />
      </div>

      {/* 4 Metric cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-divider bg-surface p-6 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-10 w-10 bg-divider/30 rounded-xl" />
              <div className="h-7 w-12 bg-divider/40 rounded" />
            </div>
            <div className="h-4 w-28 bg-divider/30 rounded" />
            <div className="h-3 w-40 bg-divider/20 rounded" />
          </div>
        ))}
      </div>

      {/* Dual stream split skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4">
          <div className="h-6 w-36 bg-divider/40 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-divider/20 rounded-xl" />
          ))}
        </div>
        <div className="rounded-2xl border border-divider bg-surface p-6 space-y-4">
          <div className="h-6 w-36 bg-divider/40 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-divider/20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
