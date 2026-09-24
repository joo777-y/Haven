"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderHeart,
  Building2,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { CollectionPreviewItem } from "@/types/collection";
import { formatPropertyPrice } from "@/types/property";
import { deleteCollectionAction } from "@/lib/collections/actions";

interface CollectionCardProps {
  collection: CollectionPreviewItem;
  onRename?: (collection: CollectionPreviewItem) => void;
  onDeleteSuccess?: (collectionId: string) => void;
}

export default function CollectionCard({
  collection,
  onRename,
  onDeleteSuccess,
}: CollectionCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);

    if (
      !confirm(
        `Are you sure you want to delete "${collection.name}"? This action will not delete the properties themselves.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCollectionAction(collection.id);
      if (res.success) {
        onDeleteSuccess?.(collection.id);
      } else {
        alert(res.error || "Failed to delete collection.");
      }
    });
  };

  const images = collection.previewImages || [];

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-divider bg-surface transition-all duration-300 hover:border-primary/40 hover:shadow-card ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Top Mosaic Viewport */}
      <Link
        href={`/dashboard/collections/${collection.id}`}
        className="relative aspect-[16/10] w-full overflow-hidden bg-background block"
      >
        {images.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-muted group-hover:text-primary transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-divider mb-2">
              <FolderHeart className="h-6 w-6 text-secondary/70" />
            </div>
            <span className="font-display text-xs uppercase tracking-wider text-muted">
              Empty Collection
            </span>
          </div>
        ) : images.length === 1 ? (
          <Image
            src={images[0]}
            alt={collection.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : images.length === 2 ? (
          <div className="grid h-full w-full grid-cols-2 gap-0.5">
            {images.slice(0, 2).map((img, i) => (
              <div key={i} className="relative h-full w-full overflow-hidden">
                <Image
                  src={img}
                  alt={`${collection.name} preview ${i + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : images.length === 3 ? (
          <div className="grid h-full w-full grid-cols-2 gap-0.5">
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={images[0]}
                alt={`${collection.name} preview 1`}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="grid h-full w-full grid-rows-2 gap-0.5">
              {images.slice(1, 3).map((img, i) => (
                <div key={i} className="relative h-full w-full overflow-hidden">
                  <Image
                    src={img}
                    alt={`${collection.name} preview ${i + 2}`}
                    fill
                    sizes="20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            {images.slice(0, 4).map((img, i) => (
              <div key={i} className="relative h-full w-full overflow-hidden">
                <Image
                  src={img}
                  alt={`${collection.name} preview ${i + 1}`}
                  fill
                  sizes="20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Counter Badge Overlay */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Building2 className="h-3 w-3" />
            <span>
              {collection.propertyCount}{" "}
              {collection.propertyCount === 1 ? "Residence" : "Residences"}
            </span>
          </span>
        </div>
      </Link>

      {/* Card Content & Meta */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/dashboard/collections/${collection.id}`}
              className="font-display text-lg font-semibold text-foreground hover:text-secondary truncate block transition-colors"
            >
              {collection.name}
            </Link>
            <p className="text-xs text-muted mt-0.5">
              {collection.totalValue > 0 ? (
                <>
                  <span className="font-medium text-foreground">
                    {formatPropertyPrice(collection.totalValue)}
                  </span>
                  <span className="text-muted/60 mx-1">•</span>
                  <span>Portfolio Value</span>
                </>
              ) : (
                "Curated Selection"
              )}
            </p>
          </div>

          {/* Action Menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-divider hover:bg-background text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Collection options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-30 w-36 origin-top-right rounded-xl border border-divider bg-background p-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onRename?.(collection);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-surface transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted" />
                    <span>Rename</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-3 border-t border-divider/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted">
            Updated{" "}
            {new Date(collection.updated_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>

          <Link
            href={`/dashboard/collections/${collection.id}`}
            className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
          >
            <span>View Portfolio</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
