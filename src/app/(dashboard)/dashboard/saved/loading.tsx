import PropertyGrid from "@/components/properties/PropertyGrid";

export default function SavedPropertiesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-6 border-b border-divider">
        <div className="h-4 w-32 rounded bg-divider/40" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-60 rounded-lg bg-divider/50" />
            <div className="h-4 w-80 rounded bg-divider/40" />
          </div>
          <div className="h-6 w-24 rounded-full bg-divider/40" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <PropertyGrid properties={[]} isLoading={true} />
    </div>
  );
}
