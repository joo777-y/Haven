import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Building2, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AgentPropertyActions from "@/components/properties/AgentPropertyActions";
import { getAgentProperties } from "@/lib/properties/queries";
import { formatPropertyPrice, getCoverImageUrl } from "@/types/property";

export const metadata: Metadata = {
  title: "My Listings Portfolio | HAVEN Advisor",
  description: "Manage, publish, edit, and archive your property listings.",
};

export default async function AgentPropertiesPage() {
  // Fetch properties owned exclusively by this authenticated advisor
  const properties = await getAgentProperties();

  const draftCount = properties.filter((p) => p.status === "draft").length;
  const publishedCount = properties.filter(
    (p) => p.status === "published"
  ).length;
  const archivedCount = properties.filter(
    (p) => p.status === "archived"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/agent"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Advisor Portal</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Listing Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Manage, edit, publish, and archive your luxury architectural
              listings.
            </p>
          </div>

          <Link href="/agent/properties/new">
            <Button variant="secondary" size="md" className="gap-2 text-xs">
              <PlusCircle className="h-4 w-4" />
              <span>Add New Property</span>
            </Button>
          </Link>
        </div>

        {/* Portfolio Stats Counter */}
        <div className="flex items-center gap-3 pt-2 flex-wrap text-xs">
          <div className="rounded-lg border border-divider bg-surface px-3 py-1.5 flex items-center gap-2">
            <span className="text-muted">Total:</span>
            <span className="font-bold text-foreground">{properties.length}</span>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Published: {publishedCount}
            </span>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              Draft: {draftCount}
            </span>
          </div>

          <div className="rounded-lg border border-divider bg-surface/60 px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted/60" />
            <span className="text-muted font-medium">
              Archived: {archivedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Listings Table / Cards */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-divider bg-surface/50 py-16 px-6 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-divider text-muted mb-4 shadow-xs">
            <Building2 className="h-8 w-8 text-muted/60" />
          </div>

          <h2 className="font-display text-xl font-semibold text-foreground">
            No listings in your portfolio yet
          </h2>

          <p className="font-sans text-xs sm:text-sm text-muted max-w-sm mt-1.5 leading-relaxed">
            Create your first property listing to showcase architectural
            residences to prospective buyers on HAVEN.
          </p>

          <div className="mt-6">
            <Link href="/agent/properties/new">
              <Button variant="secondary" size="md" className="gap-2 text-xs">
                <PlusCircle className="h-4 w-4" />
                <span>Create First Listing</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-divider bg-surface overflow-hidden shadow-xs">
          <div className="divide-y divide-divider">
            {properties.map((property) => {
              const coverUrl = getCoverImageUrl(property.property_images);
              const formattedPrice = formatPropertyPrice(
                property.price,
                property.listing_type
              );

              return (
                <div
                  key={property.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors hover:bg-background/40"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative aspect-[4/3] w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-divider bg-background">
                      {coverUrl && coverUrl !== "/placeholder-property.jpg" ? (
                        <img
                          src={coverUrl}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted/40">
                          <Building2 className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        {property.status === "published" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        )}

                        {property.status === "draft" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}

                        {property.status === "archived" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 border border-gray-500/20">
                            Archived
                          </span>
                        )}

                        <Badge
                          variant="surface"
                          size="sm"
                          className="capitalize text-[11px]"
                        >
                          {property.property_type}
                        </Badge>

                        <span className="text-[11px] text-muted uppercase font-medium">
                          {property.listing_type === "rent"
                            ? "For Rent"
                            : "For Sale"}
                        </span>
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-semibold text-foreground truncate">
                        {property.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-muted">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-secondary shrink-0" />
                          <span className="truncate">
                            {property.neighborhood
                              ? `${property.neighborhood}, ${property.city}`
                              : property.city}
                          </span>
                        </div>

                        <span className="font-semibold text-foreground">
                          {formattedPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="sm:self-center shrink-0">
                    <AgentPropertyActions
                      propertyId={property.id}
                      slug={property.slug}
                      status={property.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
