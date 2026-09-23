import Container from "@/components/layout/Container";
import PropertyGrid from "@/components/properties/PropertyGrid";

export default function PropertyDetailLoading() {
  return (
    <div className="py-10 space-y-10">
      <Container>
        {/* Back Link Skeleton */}
        <div className="h-4 w-40 rounded bg-divider/40 animate-pulse mb-6" />

        {/* Title Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-divider animate-pulse">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-24 rounded-full bg-divider/50" />
              <div className="h-4 w-20 rounded bg-divider/40" />
            </div>
            <div className="h-10 w-72 sm:w-96 rounded-lg bg-divider/50" />
            <div className="h-4 w-48 rounded bg-divider/40" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-divider/40" />
            <div className="h-8 w-36 rounded-lg bg-divider/50" />
          </div>
        </div>

        {/* Gallery Viewport Skeleton */}
        <div className="aspect-[16/10] md:aspect-[21/10] w-full rounded-2xl bg-divider/40 animate-pulse mt-8" />

        {/* Key Specs Bar Skeleton */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 rounded-2xl border border-divider bg-surface p-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center flex flex-col items-center">
              <div className="h-5 w-5 rounded-full bg-divider/50" />
              <div className="h-3 w-14 rounded bg-divider/40" />
              <div className="h-5 w-16 rounded bg-divider/50" />
            </div>
          ))}
        </div>

        {/* Main Content Layout Skeleton */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8 animate-pulse">
            <div className="space-y-3">
              <div className="h-7 w-48 rounded bg-divider/50" />
              <div className="h-4 w-full rounded bg-divider/40" />
              <div className="h-4 w-5/6 rounded bg-divider/40" />
              <div className="h-4 w-4/6 rounded bg-divider/40" />
            </div>

            <div className="pt-6 border-t border-divider space-y-4">
              <div className="h-7 w-44 rounded bg-divider/50" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-lg bg-divider/40" />
                ))}
              </div>
            </div>
          </div>

          <div className="animate-pulse">
            <div className="rounded-2xl border border-divider bg-surface p-6 space-y-5">
              <div className="h-6 w-32 rounded bg-divider/50" />
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-divider/50" />
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-divider/50" />
                  <div className="h-3 w-20 rounded bg-divider/40" />
                </div>
              </div>
              <div className="h-10 w-full rounded-lg bg-divider/50" />
            </div>
          </div>
        </div>

        {/* Similar Properties Skeleton */}
        <div className="mt-20 pt-10 border-t border-divider space-y-6">
          <div className="h-7 w-52 rounded bg-divider/50" />
          <PropertyGrid properties={[]} isLoading={true} />
        </div>
      </Container>
    </div>
  );
}
