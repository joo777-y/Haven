"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  PlusCircle,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  X,
  Check,
  CheckSquare,
  Square,
  UploadCloud,
  FileText,
  Archive,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import AgentPropertyActions from "./AgentPropertyActions";
import type { PropertyWithDetails, PropertyStatus } from "@/types/property";
import {
  formatPropertyPrice,
  getCoverImageUrl,
  formatPropertyArea,
} from "@/types/property";
import {
  bulkUpdatePropertyStatusAction,
  bulkDeletePropertiesAction,
} from "@/lib/properties/actions";

interface AgentPropertyManagerProps {
  initialProperties: PropertyWithDetails[];
}

export default function AgentPropertyManager({
  initialProperties,
}: AgentPropertyManagerProps) {
  const router = useRouter();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "published" | "draft" | "archived"
  >("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_desc" | "price_asc">(
    "newest"
  );

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkPending, startBulkTransition] = useTransition();
  const [bulkFeedback, setBulkFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Counts for tabs
  const publishedCount = useMemo(
    () => initialProperties.filter((p) => p.status === "published").length,
    [initialProperties]
  );
  const draftCount = useMemo(
    () => initialProperties.filter((p) => p.status === "draft").length,
    [initialProperties]
  );
  const archivedCount = useMemo(
    () => initialProperties.filter((p) => p.status === "archived").length,
    [initialProperties]
  );

  // Filtered & Sorted Properties
  const filteredProperties = useMemo(() => {
    return initialProperties
      .filter((p) => {
        // Status filter
        if (selectedStatus !== "all" && p.status !== selectedStatus) {
          return false;
        }

        // Type filter
        if (selectedType !== "all" && p.property_type !== selectedType) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          const matchNeigh = p.neighborhood?.toLowerCase().includes(q);
          if (!matchTitle && !matchCity && !matchNeigh) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_desc") {
          return Number(b.price) - Number(a.price);
        }
        if (sortBy === "price_asc") {
          return Number(a.price) - Number(b.price);
        }
        // newest
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [initialProperties, selectedStatus, selectedType, searchQuery, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "all" ||
    selectedType !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortBy("newest");
  };

  // Selection Helpers
  const isAllSelected =
    filteredProperties.length > 0 &&
    filteredProperties.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProperties.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Update Handler
  const handleBulkStatusChange = (targetStatus: PropertyStatus) => {
    if (selectedIds.length === 0) return;
    setBulkFeedback(null);

    startBulkTransition(async () => {
      const res = await bulkUpdatePropertyStatusAction(selectedIds, targetStatus);
      if (res.success) {
        setSelectedIds([]);
        setBulkFeedback({
          type: "success",
          message: `Successfully updated ${res.data?.updatedCount || selectedIds.length} properties to '${targetStatus}'.`,
        });
        router.refresh();
      } else {
        setBulkFeedback({
          type: "error",
          message: res.error || "Failed to update selected properties.",
        });
      }
    });
  };

  // Bulk Delete Handler
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkFeedback(null);

    startBulkTransition(async () => {
      const res = await bulkDeletePropertiesAction(selectedIds);
      if (res.success) {
        setIsBulkDeleteModalOpen(false);
        setSelectedIds([]);
        setBulkFeedback({
          type: "success",
          message: `Successfully deleted ${res.data?.deletedCount || selectedIds.length} listings and purged their storage photography.`,
        });
        router.refresh();
      } else {
        setBulkFeedback({
          type: "error",
          message: res.error || "Failed to delete selected listings.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-divider pb-4 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface text-muted hover:text-foreground hover:bg-surface/80 border border-divider"
          }`}
        >
          <span>All Listings</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "all"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {initialProperties.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("published")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "published"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/5 border border-divider"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Published</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "published"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {publishedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("draft")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "draft"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-500/5 border border-divider"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>Drafts</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "draft"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {draftCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("archived")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "archived"
              ? "bg-gray-700 text-white shadow-xs"
              : "bg-surface text-muted hover:text-foreground hover:bg-surface/80 border border-divider"
          }`}
        >
          <span>Archived</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "archived"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {archivedCount}
          </span>
        </button>
      </div>

      {/* 2. Search & Secondary Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <Input
            placeholder="Search by title, city, or neighborhood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Property Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 rounded-xl border border-divider bg-surface px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/40"
          >
            <option value="all">All Property Types</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="penthouse">Penthouse</option>
            <option value="chalet">Chalet</option>
            <option value="townhouse">Townhouse</option>
            <option value="studio">Studio</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 rounded-xl border border-divider bg-surface px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/40"
          >
            <option value="newest">Newest First</option>
            <option value="price_desc">Highest Price</option>
            <option value="price_asc">Lowest Price</option>
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 px-2.5 text-xs text-muted hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. Operational Feedback Banner */}
      {bulkFeedback && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-2xl border text-xs transition-all ${
            bulkFeedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {bulkFeedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            )}
            <p className="font-medium">{bulkFeedback.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setBulkFeedback(null)}
            className="p-1 text-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4. Bulk Operations Control Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-secondary/30 bg-secondary/5 text-foreground shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer"
            >
              <div className="h-4 w-4 rounded-md border border-secondary bg-secondary text-white flex items-center justify-center">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
              <span>
                {selectedIds.length} {selectedIds.length === 1 ? "property" : "properties"} selected
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Publish */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkPending}
              onClick={() => handleBulkStatusChange("published")}
              className="h-8 px-2.5 text-xs gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              title="Publish all selected listings to public catalog"
            >
              {isBulkPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UploadCloud className="h-3.5 w-3.5" />
              )}
              <span>Publish</span>
            </Button>

            {/* Bulk Unpublish / Move to Draft */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkPending}
              onClick={() => handleBulkStatusChange("draft")}
              className="h-8 px-2.5 text-xs gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              title="Move selected listings to draft status"
            >
              {isBulkPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              <span>Unpublish (Draft)</span>
            </Button>

            {/* Bulk Archive */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkPending}
              onClick={() => handleBulkStatusChange("archived")}
              className="h-8 px-2.5 text-xs gap-1.5 text-muted hover:text-foreground"
              title="Archive selected listings"
            >
              {isBulkPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Archive className="h-3.5 w-3.5" />
              )}
              <span>Archive</span>
            </Button>

            {/* Bulk Delete */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkPending}
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="h-8 px-2.5 text-xs gap-1.5 border-red-500/40 text-red-600 hover:bg-red-500/10"
              title="Delete selected listings and clean up storage"
            >
              {isBulkPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Delete</span>
            </Button>

            {/* Clear Selection */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBulkPending}
              onClick={() => setSelectedIds([])}
              className="h-8 px-2 text-xs text-muted hover:text-foreground"
              title="Deselect all"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 5. Listings Inventory List */}
      {filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-divider bg-surface/50 py-16 px-6 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background border border-divider text-muted mb-3 shadow-xs">
            <Building2 className="h-7 w-7 text-muted/60" />
          </div>

          <h3 className="font-display text-lg font-semibold text-foreground">
            {hasActiveFilters
              ? "No listings match your search filters"
              : "No listings in your portfolio yet"}
          </h3>

          <p className="font-sans text-xs text-muted max-w-sm mt-1 leading-relaxed">
            {hasActiveFilters
              ? "Try adjusting your search keywords, status filter, or property category to see results."
              : "Create your first luxury architectural residence to showcase to prospective buyers on HAVEN."}
          </p>

          <div className="mt-5">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All Filters
              </Button>
            ) : (
              <Link href="/agent/properties/new">
                <Button variant="secondary" size="md" className="gap-2 text-xs">
                  <PlusCircle className="h-4 w-4" />
                  <span>Create First Listing</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-divider bg-surface overflow-hidden shadow-xs">
          {/* Header Row with Select All */}
          <div className="p-3 sm:px-6 bg-background/50 border-b border-divider flex items-center justify-between text-xs text-muted font-medium">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 hover:text-foreground cursor-pointer"
            >
              <div
                className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
                  isAllSelected
                    ? "bg-secondary border-secondary text-white"
                    : "border-divider bg-surface hover:border-muted"
                }`}
              >
                {isAllSelected && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <span>
                {isAllSelected ? "Deselect All" : "Select All"} ({filteredProperties.length})
              </span>
            </button>

            <span>
              Showing {filteredProperties.length} of {initialProperties.length} listings
            </span>
          </div>

          <div className="divide-y divide-divider">
            {filteredProperties.map((property) => {
              const coverUrl = getCoverImageUrl(property.property_images);
              const formattedPrice = formatPropertyPrice(
                property.price,
                property.listing_type
              );
              const formattedArea = formatPropertyArea(property.area);
              const isSelected = selectedIds.includes(property.id);

              return (
                <div
                  key={property.id}
                  className={`p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors ${
                    isSelected ? "bg-secondary/5" : "hover:bg-background/40"
                  }`}
                >
                  {/* Left: Checkbox + Thumbnail & Details */}
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    {/* Row Select Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(property.id)}
                      className="pt-1.5 shrink-0 text-muted hover:text-foreground cursor-pointer"
                      title={isSelected ? "Deselect listing" : "Select listing"}
                    >
                      <div
                        className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-secondary border-secondary text-white"
                            : "border-divider bg-background hover:border-muted"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>

                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] w-24 sm:w-32 shrink-0 overflow-hidden rounded-xl border border-divider bg-background">
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

                      <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                        <div className="flex items-center gap-1">
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

                        <div className="flex items-center gap-3 text-muted/70 text-[11px]">
                          {property.bedrooms !== null && (
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              {property.bedrooms} Beds
                            </span>
                          )}
                          {property.bathrooms !== null && (
                            <span className="flex items-center gap-1">
                              <Bath className="h-3 w-3" />
                              {property.bathrooms} Baths
                            </span>
                          )}
                          {property.area && (
                            <span className="flex items-center gap-1">
                              <Maximize2 className="h-3 w-3" />
                              {formattedArea}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Toolbar */}
                  <div className="lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-divider/60">
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

      {/* 6. Bulk Deletion Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <Modal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => !isBulkPending && setIsBulkDeleteModalOpen(false)}
          title="Confirm Bulk Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  Permanently delete {selectedIds.length} {selectedIds.length === 1 ? "listing" : "listings"}?
                </p>
                <p className="text-red-600/90 dark:text-red-400/90 leading-relaxed">
                  This action is permanent and cannot be undone. Selected property records, child features, associated client inquiries, buyer favorites, and all high-resolution photography stored in Supabase Storage will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isBulkPending}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isBulkPending}
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs"
              >
                {isBulkPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting {selectedIds.length} listings...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete {selectedIds.length} Listings</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
