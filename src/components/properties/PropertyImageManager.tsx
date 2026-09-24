"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { PropertyImageRow } from "@/types/property";
import {
  uploadPropertyImageAction,
  setCoverImageAction,
  reorderPropertyImagesAction,
  deletePropertyImageAction,
} from "@/lib/properties/actions";

interface PropertyImageManagerProps {
  propertyId: string;
  initialImages: PropertyImageRow[];
  onImagesChange?: (images: PropertyImageRow[]) => void;
}

export default function PropertyImageManager({
  propertyId,
  initialImages,
  onImagesChange,
}: PropertyImageManagerProps) {
  const [images, setImages] = useState<PropertyImageRow[]>(
    [...initialImages].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [isPending, startTransition] = useTransition();
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  // 1. Handle Multiple File Uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadingCount(files.length);

    const uploadedList: PropertyImageRow[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size (< 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} exceeds the 10MB limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("file", file);

      try {
        const res = await uploadPropertyImageAction(formData);
        if (res.success && res.data) {
          uploadedList.push(res.data as PropertyImageRow);
        } else {
          errors.push(res.error || `Failed to upload ${file.name}`);
        }
      } catch (err) {
        errors.push(`Upload error for ${file.name}`);
      }
    }

    setUploadingCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (uploadedList.length > 0) {
      setImages((prev) => {
        const combined = [...prev, ...uploadedList];
        // Ensure one cover is selected
        const hasCover = combined.some((img) => img.is_cover);
        if (!hasCover && combined.length > 0) {
          combined[0].is_cover = true;
        }
        return combined.sort((a, b) => a.sort_order - b.sort_order);
      });
      setSuccessMessage(
        `Successfully uploaded ${uploadedList.length} ${
          uploadedList.length === 1 ? "image" : "images"
        }.`
      );
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(" • "));
    }
  };

  // 2. Set Cover Image
  const handleSetCover = (imageId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Optimistic update
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_cover: img.id === imageId,
      }))
    );

    startTransition(async () => {
      const res = await setCoverImageAction(propertyId, imageId);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update cover image.");
        // Rollback
        setImages([...initialImages].sort((a, b) => a.sort_order - b.sort_order));
      } else {
        setSuccessMessage("Cover image updated successfully.");
      }
    });
  };

  // 3. Reorder Images (Move Left / Right)
  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newOrder = [...images];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    // Update sort_order locally
    const updated = newOrder.map((item, idx) => ({
      ...item,
      sort_order: idx,
    }));
    setImages(updated);

    startTransition(async () => {
      const orderedIds = updated.map((img) => img.id);
      const res = await reorderPropertyImagesAction(propertyId, orderedIds);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to save new image order.");
      }
    });
  };

  // 4. Delete Image
  const handleDelete = (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Optimistic removal
    const target = images.find((img) => img.id === imageId);
    const remaining = images.filter((img) => img.id !== imageId);

    if (target?.is_cover && remaining.length > 0) {
      remaining[0].is_cover = true;
    }
    setImages(remaining);

    startTransition(async () => {
      const res = await deletePropertyImageAction(propertyId, imageId);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to delete image.");
        // Rollback
        setImages(images);
      } else {
        setSuccessMessage("Image removed successfully.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Property Photography & Media
          </h2>
          <p className="text-xs text-muted mt-1">
            Upload high-resolution photography (up to 10MB each). The primary cover
            image anchors catalog cards and detail headers.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={uploadingCount > 0 || isPending}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 text-xs"
          >
            {uploadingCount > 0 ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading {uploadingCount} files...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Upload Photos</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Images Grid or Empty State */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-divider hover:border-primary/40 bg-background/50 py-12 px-6 text-center cursor-pointer transition-colors"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface border border-divider text-muted mb-3 shadow-xs">
            <Building2 className="h-7 w-7 text-muted/60" />
          </div>
          <h3 className="font-display text-base font-semibold text-foreground">
            No Images Uploaded Yet
          </h3>
          <p className="text-xs text-muted max-w-sm mt-1">
            Click anywhere in this box or use the &quot;Upload Photos&quot; button
            to select JPG, PNG, WebP, or AVIF photography.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((img, idx) => {
            const isSupabaseStorage = img.image_url.startsWith(
              "https://afxgijkdaaidklzhwell.supabase.co"
            );

            return (
              <div
                key={img.id}
                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-background transition-all shadow-xs ${
                  img.is_cover
                    ? "border-secondary ring-2 ring-secondary/20"
                    : "border-divider"
                }`}
              >
                {/* Thumbnail Viewport */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
                  <Image
                    src={img.image_url}
                    alt={`Property image ${idx + 1}`}
                    fill
                    unoptimized={!isSupabaseStorage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                    {img.is_cover && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary text-white px-2.5 py-0.5 text-[11px] font-semibold shadow-xs">
                        <Star className="h-3 w-3 fill-white" />
                        Cover
                      </span>
                    )}
                    <Badge variant="surface" size="sm" className="bg-black/50 text-white backdrop-blur-md">
                      #{idx + 1}
                    </Badge>
                  </div>

                  {/* Delete Button Overlay */}
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    disabled={isPending}
                    className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-red-600 transition-colors cursor-pointer"
                    title="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between p-2.5 bg-surface border-t border-divider text-xs">
                  {/* Reorder Arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0 || isPending}
                      onClick={() => handleMove(idx, "left")}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-divider hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move earlier in gallery"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-muted" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1 || isPending}
                      onClick={() => handleMove(idx, "right")}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-divider hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move later in gallery"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-muted" />
                    </button>
                  </div>

                  {/* Cover Toggle Button */}
                  {!img.is_cover ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSetCover(img.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-secondary cursor-pointer transition-colors"
                    >
                      <Star className="h-3 w-3" />
                      <span>Set as Cover</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-secondary">
                      Active Cover
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
