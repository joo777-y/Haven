"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Building,
  DollarSign,
  MapPin,
  ChevronDown,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const sortOptions = [
  { value: "newest", label: "Sort by: Newest Listed" },
  { value: "price_asc", label: "Sort by: Price (Low to High)" },
  { value: "price_desc", label: "Sort by: Price (High to Low)" },
  { value: "price_sqm", label: "Sort by: Price per m²" },
  { value: "bedrooms", label: "Sort by: Most Bedrooms" },
];

const listingTypeOptions = [
  { value: "all", label: "All Listing Types" },
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

const propertyTypeOptions = [
  { value: "all", label: "All Categories" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "penthouse", label: "Penthouse" },
  { value: "townhouse", label: "Townhouse" },
  { value: "chalet", label: "Chalet" },
  { value: "studio", label: "Studio" },
];

const bedroomOptions = [
  { value: "any", label: "Any Bedrooms" },
  { value: "1", label: "1+ Bedroom" },
  { value: "2", label: "2+ Bedrooms" },
  { value: "3", label: "3+ Bedrooms" },
  { value: "4", label: "4+ Bedrooms" },
  { value: "5", label: "5+ Bedrooms" },
];

const bathroomOptions = [
  { value: "any", label: "Any Bathrooms" },
  { value: "1", label: "1+ Bathroom" },
  { value: "2", label: "2+ Bathrooms" },
  { value: "3", label: "3+ Bathrooms" },
];

interface PropertyFiltersBarProps {
  totalCount: number;
}

export default function PropertyFiltersBar({
  totalCount,
}: PropertyFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for keyword input to allow typing before submitting
  const initialQ = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Active filter values from URL searchParams
  const activeType = searchParams.get("type") || "all";
  const activeCategory = searchParams.get("category") || "all";
  const activeBedrooms = searchParams.get("bedrooms") || "any";
  const activeBathrooms = searchParams.get("bathrooms") || "any";
  const activeSort = searchParams.get("sort") || "newest";
  const activeCity = searchParams.get("city") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activeMinArea = searchParams.get("minArea") || "";

  // Count active secondary filters to show a badge on the toggle
  const advancedCount = [
    activeCity,
    activeMinPrice,
    activeMaxPrice,
    activeMinArea,
    activeBathrooms !== "any" ? activeBathrooms : "",
  ].filter(Boolean).length;

  const hasAnyActiveFilters =
    Boolean(searchParams.get("q")) ||
    activeType !== "all" ||
    activeCategory !== "all" ||
    activeBedrooms !== "any" ||
    activeBathrooms !== "any" ||
    Boolean(activeCity) ||
    Boolean(activeMinPrice) ||
    Boolean(activeMaxPrice) ||
    Boolean(activeMinArea);

  // Helper to commit parameter updates to the URL
  const updateUrlParams = (
    updates: Record<string, string | number | undefined | null>
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all" ||
        value === "any"
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset pagination to page 1 whenever any filter changes
    if (!("page" in updates)) {
      params.delete("page");
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  // Auto-debounce keyword search input changes (400ms)
  useEffect(() => {
    const currentQ = (searchParams.get("q") || "").trim();
    if (searchQuery.trim() === currentQ) {
      return;
    }

    const timer = setTimeout(() => {
      updateUrlParams({ q: searchQuery.trim() });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchQuery.trim() });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs space-y-4">
      {/* 1. Top Segmented Controls: Listing Type (All / Buy / Rent) & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider/60">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background border border-divider/80 w-fit">
          <button
            type="button"
            onClick={() => updateUrlParams({ type: "all" })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeType === "all"
                ? "bg-surface text-primary shadow-xs font-bold"
                : "text-muted hover:text-primary"
            }`}
          >
            All Residences
          </button>
          <button
            type="button"
            onClick={() => updateUrlParams({ type: "sale" })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeType === "sale"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-primary"
            }`}
          >
            For Sale (Buy)
          </button>
          <button
            type="button"
            onClick={() => updateUrlParams({ type: "rent" })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeType === "rent"
                ? "bg-secondary text-white shadow-xs"
                : "text-muted hover:text-primary"
            }`}
          >
            For Rent
          </button>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => updateUrlParams({ category: "all" })}
            className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === "all"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-divider/80 text-muted hover:border-primary/40 hover:text-primary"
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => updateUrlParams({ category: "villa" })}
            className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === "villa"
                ? "border-secondary bg-secondary/15 text-secondary font-bold"
                : "border-divider/80 text-muted hover:border-secondary/40 hover:text-secondary"
            }`}
          >
            Villas
          </button>
          <button
            type="button"
            onClick={() => updateUrlParams({ category: "penthouse" })}
            className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === "penthouse"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-divider/80 text-muted hover:border-primary/40 hover:text-primary"
            }`}
          >
            Penthouses
          </button>
          <button
            type="button"
            onClick={() => updateUrlParams({ category: "apartment" })}
            className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === "apartment"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-divider/80 text-muted hover:border-primary/40 hover:text-primary"
            }`}
          >
            Apartments
          </button>
          <button
            type="button"
            onClick={() => updateUrlParams({ category: "chalet" })}
            className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
              activeCategory === "chalet"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-divider/80 text-muted hover:border-primary/40 hover:text-primary"
            }`}
          >
            Chalets & Coastal
          </button>
        </div>
      </div>

      {/* Primary Filter Row */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-end">
          {/* Keyword Search */}
          <div className="md:col-span-4">
            <Input
              label="Search Keyword"
              placeholder="Search by title, city, or neighborhood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted" />}
              rightIcon={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      updateUrlParams({ q: "" });
                    }}
                    className="cursor-pointer text-muted hover:text-foreground"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Listing Type Select */}
          <div className="md:col-span-2">
            <Select
              label="Listing Type"
              options={listingTypeOptions}
              value={activeType}
              onChange={(e) => updateUrlParams({ type: e.target.value })}
            />
          </div>

          {/* Category Select */}
          <div className="md:col-span-2">
            <Select
              label="Property Type"
              options={propertyTypeOptions}
              value={activeCategory}
              onChange={(e) => updateUrlParams({ category: e.target.value })}
            />
          </div>

          {/* Bedrooms Select */}
          <div className="md:col-span-2">
            <Select
              label="Bedrooms"
              options={bedroomOptions}
              value={activeBedrooms}
              onChange={(e) => updateUrlParams({ bedrooms: e.target.value })}
            />
          </div>

          {/* Action Buttons: More Filters & Reset */}
          <div className="md:col-span-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className={`flex-1 h-[42px] flex items-center justify-center gap-1.5 text-xs transition-colors ${
                showAdvanced || advancedCount > 0
                  ? "border-primary bg-primary/5 text-primary"
                  : ""
              }`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {advancedCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {advancedCount}
                </span>
              )}
            </Button>

            {hasAnyActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="h-[42px] px-2.5 text-xs text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={handleResetFilters}
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Advanced Filter Drawer / Secondary Row */}
      {showAdvanced && (
        <div className="rounded-xl border border-divider/80 bg-background/50 p-4 space-y-4 pt-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center justify-between">
            <span>Detailed Filter Parameters</span>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-muted hover:text-foreground text-xs cursor-pointer flex items-center gap-1"
            >
              Close
              <ChevronDown className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end">
            {/* City */}
            <div>
              <Input
                label="City / Location"
                placeholder="e.g. Cairo, Giza"
                defaultValue={activeCity}
                onBlur={(e) => updateUrlParams({ city: e.target.value.trim() })}
                leftIcon={<MapPin className="h-3.5 w-3.5 text-muted" />}
              />
            </div>

            {/* Min Price */}
            <div>
              <Input
                label="Min Price ($)"
                type="number"
                min="0"
                step="10000"
                placeholder="0"
                defaultValue={activeMinPrice}
                onBlur={(e) => updateUrlParams({ minPrice: e.target.value })}
                leftIcon={<DollarSign className="h-3.5 w-3.5 text-muted" />}
              />
            </div>

            {/* Max Price */}
            <div>
              <Input
                label="Max Price ($)"
                type="number"
                min="0"
                step="50000"
                placeholder="No limit"
                defaultValue={activeMaxPrice}
                onBlur={(e) => updateUrlParams({ maxPrice: e.target.value })}
                leftIcon={<DollarSign className="h-3.5 w-3.5 text-muted" />}
              />
            </div>

            {/* Bathrooms */}
            <div>
              <Select
                label="Bathrooms"
                options={bathroomOptions}
                value={activeBathrooms}
                onChange={(e) => updateUrlParams({ bathrooms: e.target.value })}
              />
            </div>

            {/* Min Area */}
            <div>
              <Input
                label="Min Area (sqm)"
                type="number"
                min="0"
                placeholder="e.g. 150"
                defaultValue={activeMinArea}
                onBlur={(e) => updateUrlParams({ minArea: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bar Bottom - Active Counts & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-divider/60">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Catalog Results:</span>
          <Badge variant="secondary" size="sm" className="font-medium">
            {totalCount} {totalCount === 1 ? "Property" : "Properties"}
          </Badge>
          {isPending && (
            <span className="text-[11px] text-muted animate-pulse">
              Updating...
            </span>
          )}
        </div>

        <div className="w-full sm:w-64">
          <Select
            options={sortOptions}
            value={activeSort}
            onChange={(e) => updateUrlParams({ sort: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
