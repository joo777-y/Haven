export default function AgentPropertiesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <div className="h-4 w-32 rounded bg-divider/40" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-lg bg-divider/50" />
            <div className="h-4 w-96 rounded bg-divider/40" />
          </div>
          <div className="h-10 w-36 rounded-lg bg-divider/50" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-7 w-20 rounded bg-divider/40" />
          <div className="h-7 w-28 rounded bg-divider/40" />
          <div className="h-7 w-24 rounded bg-divider/40" />
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="rounded-2xl border border-divider bg-surface p-4 divide-y divide-divider/60">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 rounded-xl bg-divider/50 shrink-0" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-divider/50" />
                <div className="h-3 w-32 rounded bg-divider/40" />
              </div>
            </div>
            <div className="h-8 w-32 rounded-lg bg-divider/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
