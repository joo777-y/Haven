export default function EditPropertyLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-pulse">
      <div className="space-y-3 pb-6 border-b border-divider">
        <div className="h-4 w-32 rounded bg-divider/40" />
        <div className="h-8 w-64 rounded-lg bg-divider/50" />
        <div className="h-4 w-80 rounded bg-divider/40" />
      </div>

      <div className="rounded-2xl border border-divider bg-surface p-8 space-y-6">
        <div className="h-6 w-40 rounded bg-divider/50" />
        <div className="space-y-4">
          <div className="h-10 w-full rounded-lg bg-divider/40" />
          <div className="h-24 w-full rounded-lg bg-divider/40" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-10 rounded-lg bg-divider/40" />
            <div className="h-10 rounded-lg bg-divider/40" />
            <div className="h-10 rounded-lg bg-divider/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
