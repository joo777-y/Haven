import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart, Compass } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { getUserFavorites } from "@/lib/properties/queries";
import { formatPropertyCardData } from "@/types/property";
import type { Property } from "@/components/properties/PropertyCard";

export const metadata: Metadata = {
  title: "Saved Properties | HAVEN",
  description: "View your personal portfolio of bookmarked architectural residences.",
};

export default async function SavedPropertiesPage() {
  // Fetch user favorites strictly scoped to auth.uid() via Step 1 Data Access Layer
  const savedProperties = await getUserFavorites();

  const cardProperties: Property[] = savedProperties.map((p) => {
    const formatted = formatPropertyCardData(p, true);
    return {
      id: formatted.id,
      title: formatted.title,
      slug: formatted.slug,
      price: formatted.formattedPrice,
      location: formatted.location,
      image: formatted.coverImage,
      beds: formatted.bedrooms,
      baths: formatted.bathrooms,
      area: formatted.formattedArea,
      listingType: formatted.listingType,
      propertyType: formatted.propertyType,
      agent: formatted.agent,
      isSaved: true,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Saved Properties
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Your curated portfolio of bookmarked architectural properties and residences.
            </p>
          </div>

          <Badge variant="secondary" size="md" className="self-start sm:self-auto font-medium">
            {savedProperties.length}{" "}
            {savedProperties.length === 1 ? "Residence" : "Residences"}
          </Badge>
        </div>
      </div>

      {/* Content Area: Grid or Empty State */}
      {cardProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-divider bg-surface/50 py-16 px-6 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-divider text-muted mb-4 shadow-xs">
            <Heart className="h-8 w-8 text-secondary/70" />
          </div>

          <h2 className="font-display text-xl font-semibold text-foreground">
            No saved residences yet
          </h2>

          <p className="font-sans text-xs sm:text-sm text-muted max-w-sm mt-1.5 leading-relaxed">
            As you explore HAVEN, tap the heart icon on any residence to save it
            to your personal portfolio and track its status.
          </p>

          <div className="mt-6">
            <Link href="/properties">
              <Button
                variant="primary"
                size="md"
                className="flex items-center gap-2 text-xs"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Properties Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <PropertyGrid properties={cardProperties} />
      )}
    </div>
  );
}
