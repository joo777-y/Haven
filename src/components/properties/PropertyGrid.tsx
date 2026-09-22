import PropertyCard, { Property } from "./PropertyCard";
import { Building2 } from "lucide-react";

export interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onSaveToggle?: (id: string) => void;
  className?: string;
}

export default function PropertyGrid({
  properties,
  isLoading = false,
  emptyTitle = "No properties found",
  emptyDescription = "Try adjusting your search criteria or resetting filters to explore available listings.",
  onSaveToggle,
  className = "",
}: PropertyGridProps) {
  // Skeleton loader cards
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-2xl border border-divider bg-surface p-0 animate-pulse"
          >
            <div className="aspect-[4/3] w-full bg-divider/60" />
            <div className="p-5 space-y-3">
              <div className="h-6 w-1/3 rounded-md bg-divider/60" />
              <div className="h-5 w-3/4 rounded-md bg-divider/60" />
              <div className="h-4 w-1/2 rounded-md bg-divider/40" />
              <div className="pt-4 border-t border-divider/60 flex justify-between">
                <div className="h-4 w-1/4 rounded bg-divider/40" />
                <div className="h-4 w-1/4 rounded bg-divider/40" />
                <div className="h-4 w-1/4 rounded bg-divider/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty State Fallback
  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-divider bg-surface/50 py-16 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-divider text-muted mb-4 shadow-xs">
          <Building2 className="h-8 w-8 text-muted" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground">
          {emptyTitle}
        </h3>
        <p className="font-sans text-xs sm:text-sm text-muted max-w-sm mt-1.5 leading-relaxed">
          {emptyDescription}
        </p>
      </div>
    );
  }

  // Render Grid
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${className}`}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onSaveToggle={onSaveToggle}
        />
      ))}
    </div>
  );
}
