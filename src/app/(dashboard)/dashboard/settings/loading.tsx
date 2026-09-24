export default function SettingsLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <div className="h-4 w-32 bg-divider/40 rounded" />
        <div className="h-8 w-64 bg-divider/40 rounded-lg" />
        <div className="h-4 w-96 bg-divider/20 rounded" />
      </div>

      {/* Cards skeleton */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-divider bg-surface p-8 space-y-4">
          <div className="h-5 w-40 bg-divider/40 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-divider/20 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-divider bg-surface p-8 space-y-4">
          <div className="h-5 w-40 bg-divider/40 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-divider/20 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-divider bg-surface p-8 space-y-4">
          <div className="h-5 w-48 bg-divider/40 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-divider/20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
