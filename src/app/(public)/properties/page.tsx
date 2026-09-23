import { Suspense } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import PropertyGrid from "@/components/properties/PropertyGrid";
import PropertyFiltersBar from "@/components/properties/PropertyFiltersBar";
import PropertyPagination from "@/components/properties/PropertyPagination";
import Button from "@/components/ui/Button";
import {
  getPublishedProperties,
  getUserFavoritePropertyIds,
} from "@/lib/properties/queries";
import { parseFilterParams } from "@/lib/validations/property";
import { formatPropertyCardData } from "@/types/property";
import type { Property } from "@/components/properties/PropertyCard";
import { Building2, RotateCcw } from "lucide-react";

export const metadata = {
  title: "Properties Catalog | HAVEN Luxury Real Estate",
  description:
    "Explore HAVEN's curated portfolio of architectural properties, luxury villas, and exclusive residences for sale and rent.",
};

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const rawParams = await searchParams;
  const filters = parseFilterParams(rawParams);

  // Parallel server queries: catalog and batch user favorite IDs (no N+1)
  const [paginatedResult, userFavoriteIds] = await Promise.all([
    getPublishedProperties(filters),
    getUserFavoritePropertyIds(),
  ]);

  const favoriteIdSet = new Set(userFavoriteIds);

  // Transform database composite objects into UI presentation card items
  const cardProperties: Property[] = paginatedResult.data.map((item) => {
    const isSaved = favoriteIdSet.has(item.id);
    const formatted = formatPropertyCardData(item, isSaved);
    return {
      id: formatted.id,
      title: formatted.title,
      slug: formatted.slug,
      price: formatted.formattedPrice,
      location: formatted.location,
      image: formatted.coverImage,
      beds: formatted.bedrooms ?? 0,
      baths: formatted.bathrooms ?? 0,
      area: formatted.formattedArea,
      listingType: formatted.listingType,
      propertyType: formatted.propertyType,
      agent: formatted.agent,
      isSaved,
    };
  });

  const hasActiveFilters = Boolean(
    filters.query ||
      filters.listing_type ||
      filters.property_type ||
      filters.city ||
      filters.min_price !== undefined ||
      filters.max_price !== undefined ||
      filters.bedrooms !== undefined ||
      filters.bathrooms !== undefined ||
      filters.min_area !== undefined ||
      (filters.features && filters.features.length > 0)
  );

  return (
    <div className="py-12 space-y-10">
      <Container>
        {/* Header Area */}
        <SectionHeading
          subtitle="Real Estate Catalog"
          title="Explore Architectural Properties"
          description="Filter our curated collection by location, price, and specs to find your next sanctuary."
        />

        {/* Filter Controls Panel (URL Synchronized) */}
        <Suspense fallback={null}>
          <PropertyFiltersBar totalCount={paginatedResult.count} />
        </Suspense>

        {/* Property Grid Display or Empty State */}
        <div className="mt-8">
          {paginatedResult.count === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-divider bg-surface/50 py-16 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-divider text-muted mb-4 shadow-xs">
                <Building2 className="h-8 w-8 text-muted" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                No residences found
              </h3>
              <p className="font-sans text-xs sm:text-sm text-muted max-w-sm mt-1.5 leading-relaxed">
                {hasActiveFilters
                  ? "We couldn't find any listings matching your specific filter criteria. Try adjusting or clearing your filters."
                  : "There are currently no published residences available in the catalog. Please check back soon."}
              </p>
              {hasActiveFilters && (
                <div className="mt-6">
                  <Link href="/properties">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Clear All Filters</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <PropertyGrid properties={cardProperties} />
          )}
        </div>

        {/* URL-based Pagination */}
        <Suspense fallback={null}>
          <PropertyPagination
            currentPage={paginatedResult.page}
            totalPages={paginatedResult.totalPages}
          />
        </Suspense>
      </Container>
    </div>
  );
}