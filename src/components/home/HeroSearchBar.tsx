"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export interface HeroSearchValues {
  tab: "buy" | "rent";
  location: string;
  propertyType: string;
  priceRange: string;
}

export interface HeroSearchBarProps {
  onSearchSubmit?: (values: HeroSearchValues) => void;
  className?: string;
}

const propertyTypeOptions = [
  { value: "all", label: "All Property Types" },
  { value: "villa", label: "Modern Villas & Estates" },
  { value: "penthouse", label: "Penthouses & Sky Lofts" },
  { value: "chalet", label: "Coastal Sanctuaries" },
  { value: "townhouse", label: "Architectural Townhouses" },
  { value: "apartment", label: "Modern Residences" },
];

const priceRangeOptions = [
  { value: "any", label: "Any Price Range" },
  { value: "0-1000000", label: "Under $1,000,000" },
  { value: "1000000-3000000", label: "$1,000,000 - $3,000,000" },
  { value: "3000000-5000000", label: "$3,000,000 - $5,000,000" },
  { value: "5000000-10000000", label: "$5,000,000 - $10,000,000" },
  { value: "10000000+", label: "$10,000,000+" },
];

export default function HeroSearchBar({
  onSearchSubmit,
  className = "",
}: HeroSearchBarProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"buy" | "rent">("buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("any");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit({
        tab,
        location,
        propertyType,
        priceRange,
      });
    }

    // Default route push with synchronized filter parameters
    const params = new URLSearchParams();
    params.set("type", tab === "buy" ? "sale" : "rent");
    if (location.trim()) {
      params.set("q", location.trim());
    }
    if (propertyType && propertyType !== "all") {
      params.set("category", propertyType);
    }
    if (priceRange && priceRange !== "any") {
      if (priceRange.includes("-")) {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minPrice", min);
        if (max) params.set("maxPrice", max);
      } else if (priceRange.endsWith("+")) {
        const min = priceRange.replace("+", "");
        params.set("minPrice", min);
      }
    }

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div
      className={`w-full max-w-5xl rounded-2xl border border-divider/90 bg-surface/95 p-4 sm:p-6 shadow-floating backdrop-blur-md ${className}`}
    >
      {/* Mode Tabs (Buy / Rent) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-divider/70">
        <div className="inline-flex rounded-full bg-background p-1 border border-divider/60 self-start">
          <button
            type="button"
            onClick={() => setTab("buy")}
            className={`rounded-full px-4 sm:px-5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              tab === "buy"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-primary"
            }`}
          >
            Buy Residences
          </button>
          <button
            type="button"
            onClick={() => setTab("rent")}
            className={`rounded-full px-4 sm:px-5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              tab === "rent"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-primary"
            }`}
          >
            Rent Residences
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
          <Search className="h-3.5 w-3.5 text-secondary" />
          <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">
            Find Your Property
          </span>
          <span className="hidden md:inline text-muted/60">— Discover architectural listings</span>
        </div>
      </div>

      {/* Main Search Controls Grid */}
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12 items-end">
        {/* Location Input */}
        <div className="lg:col-span-4">
          <Input
            label="Location"
            placeholder="City, Neighborhood, or Region..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="h-4 w-4 text-secondary" />}
          />
        </div>

        {/* Property Type Dropdown */}
        <div className="lg:col-span-3">
          <Select
            label="Property Type"
            options={propertyTypeOptions}
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          />
        </div>

        {/* Price Range Dropdown */}
        <div className="lg:col-span-3">
          <Select
            label="Price Range"
            options={priceRangeOptions}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <div className="lg:col-span-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-[42px] flex items-center justify-center gap-2 rounded-lg font-semibold text-xs cursor-pointer shadow-xs hover:bg-secondary transition-all"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
