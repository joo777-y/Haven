import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import PropertyGrid from "@/components/properties/PropertyGrid";

export default function PropertiesLoading() {
  return (
    <div className="py-12 space-y-10">
      <Container>
        <SectionHeading
          subtitle="Real Estate Catalog"
          title="Explore Architectural Properties"
          description="Filter our curated collection by location, price, and specs to find your next sanctuary."
        />

        {/* Filters Bar Skeleton */}
        <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs space-y-4 animate-pulse">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-end">
            <div className="md:col-span-4 h-10 rounded-lg bg-divider/40" />
            <div className="md:col-span-2 h-10 rounded-lg bg-divider/40" />
            <div className="md:col-span-2 h-10 rounded-lg bg-divider/40" />
            <div className="md:col-span-2 h-10 rounded-lg bg-divider/40" />
            <div className="md:col-span-2 h-10 rounded-lg bg-divider/40" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-divider/60">
            <div className="h-5 w-32 rounded bg-divider/40" />
            <div className="h-9 w-48 rounded bg-divider/40" />
          </div>
        </div>

        {/* Property Grid Skeleton */}
        <div className="mt-8">
          <PropertyGrid properties={[]} isLoading={true} />
        </div>
      </Container>
    </div>
  );
}
