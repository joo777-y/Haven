"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Edit2,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Plus,
} from "lucide-react";
import Button from "@/components/ui/Button";
import type { CollectionWithProperties } from "@/types/collection";
import type { PropertyWithDetails } from "@/types/property";
import { formatPropertyPrice, formatPropertyArea, getCoverImageUrl } from "@/types/property";
import {
  deleteCollectionAction,
  removePropertyFromCollectionAction,
} from "@/lib/collections/actions";
import RenameCollectionDialog from "./RenameCollectionDialog";

interface CollectionDetailViewProps {
  initialCollection: CollectionWithProperties;
}

export default function CollectionDetailView({
  initialCollection,
}: CollectionDetailViewProps) {
  const router = useRouter();
  const [collection, setCollection] =
    useState<CollectionWithProperties>(initialCollection);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleDeleteCollection = () => {
    if (
      !confirm(
        `Are you sure you want to delete the collection "${collection.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCollectionAction(collection.id);
      if (res.success) {
        router.push("/dashboard/collections");
      } else {
        alert(res.error || "Failed to delete collection.");
      }
    });
  };

  const handleRemoveProperty = async (propertyId: string, propertyTitle: string) => {
    if (
      !confirm(
        `Remove "${propertyTitle}" from "${collection.name}"?`
      )
    ) {
      return;
    }

    setRemovingId(propertyId);
    try {
      const res = await removePropertyFromCollectionAction(
        collection.id,
        propertyId
      );
      if (res.success) {
        setCollection((prev) => {
          const updatedProps = prev.properties.filter(
            (p) => p.id !== propertyId
          );
          const updatedValue = updatedProps.reduce(
            (sum, p) => sum + (Number(p.price) || 0),
            0
          );
          return {
            ...prev,
            properties: updatedProps,
            propertyCount: updatedProps.length,
            totalValue: updatedValue,
          };
        });
      } else {
        alert(res.error || "Failed to remove property.");
      }
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRenameSuccess = (updated: { id: string; name: string }) => {
    setCollection((prev) => ({ ...prev, name: updated.name }));
  };

  const cities = Array.from(
    new Set(collection.properties.map((p) => p.city).filter(Boolean))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/dashboard/collections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Curated Collections</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-foreground truncate">
                {collection.name}
              </h1>
              <button
                type="button"
                onClick={() => setIsRenameOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-divider hover:bg-surface text-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Rename collection"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              Curated private portfolio with {collection.propertyCount}{" "}
              {collection.propertyCount === 1 ? "residence" : "residences"}.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link href="/properties">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Residences</span>
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteCollection}
              className="gap-1.5 text-xs text-red-600 hover:border-red-500/40 hover:bg-red-500/10 cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Delete Collection</span>
            </Button>
          </div>
        </div>

        {/* Portfolio Valuation & Summary Stats */}
        <div className="flex items-center gap-3 pt-2 flex-wrap text-xs">
          <div className="rounded-lg border border-divider bg-surface px-3 py-1.5 flex items-center gap-2">
            <span className="text-muted">Residences:</span>
            <span className="font-semibold text-foreground">
              {collection.propertyCount}
            </span>
          </div>

          {collection.totalValue > 0 && (
            <div className="rounded-lg border border-secondary/20 bg-secondary/5 px-3 py-1.5 flex items-center gap-2">
              <span className="text-secondary font-medium">
                Combined Valuation:
              </span>
              <span className="font-bold text-foreground">
                {formatPropertyPrice(collection.totalValue)}
              </span>
            </div>
          )}

          {cities.length > 0 && (
            <div className="rounded-lg border border-divider bg-surface px-3 py-1.5 flex items-center gap-2">
              <span className="text-muted">Locations:</span>
              <span className="font-medium text-foreground">
                {cities.join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Property Grid or Empty State */}
      {collection.properties.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background border border-divider text-muted shadow-xs">
            <Building2 className="h-7 w-7 text-secondary/70" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-display text-lg font-semibold text-foreground">
              This Collection is Empty
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Explore our architectural catalog to discover luxury villas,
              chalets, and penthouses, and save them to this collection.
            </p>
          </div>
          <Link href="/properties" className="inline-block pt-2">
            <Button variant="primary" size="md" className="gap-2 text-xs">
              <Building2 className="h-4 w-4" />
              <span>Explore Residences Catalog</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.properties.map((prop) => {
            const coverUrl = getCoverImageUrl(prop.property_images);
            const isSubSupabase = coverUrl.startsWith(
              "https://afxgijkdaaidklzhwell.supabase.co"
            );
            const isRemoving = removingId === prop.id;

            return (
              <article
                key={prop.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-divider bg-surface transition-all duration-300 hover:border-secondary/30 hover:shadow-card ${
                  isRemoving ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                {/* Media Viewport */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                  <Image
                    src={coverUrl}
                    alt={prop.title}
                    fill
                    unoptimized={!isSubSupabase}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="rounded-lg bg-black/60 px-3 py-1.5 font-display text-sm font-bold text-white backdrop-blur-md shadow-xs">
                      {formatPropertyPrice(prop.price, prop.listing_type)}
                    </span>
                  </div>

                  {/* Remove Button Overlay */}
                  <button
                    type="button"
                    onClick={() => handleRemoveProperty(prop.id, prop.title)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
                    title={`Remove ${prop.title} from collection`}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                      <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                      <span className="truncate">
                        {[prop.neighborhood, prop.city, prop.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>

                    <Link
                      href={`/properties/${prop.slug}`}
                      className="font-display text-base font-semibold text-foreground hover:text-secondary truncate block transition-colors"
                    >
                      {prop.title}
                    </Link>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-divider/60 text-xs text-muted">
                    {prop.bedrooms !== null && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5 shrink-0" />
                        <span>{prop.bedrooms} Beds</span>
                      </div>
                    )}
                    {prop.bathrooms !== null && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5 shrink-0" />
                        <span>{prop.bathrooms} Baths</span>
                      </div>
                    )}
                    {prop.area !== null && (
                      <div className="flex items-center gap-1">
                        <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatPropertyArea(prop.area)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="capitalize text-muted font-medium">
                      {prop.property_type}
                    </span>

                    <Link
                      href={`/properties/${prop.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
                    >
                      <span>View Details</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Rename Dialog */}
      <RenameCollectionDialog
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        collection={{ id: collection.id, name: collection.name }}
        onSuccess={handleRenameSuccess}
      />
    </div>
  );
}
