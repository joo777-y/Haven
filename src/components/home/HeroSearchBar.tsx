"use client";

import { useState } from "react";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
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
  { value: "villas", label: "Luxury Villas" },
  { value: "penthouses", label: "Penthouses" },
  { value: "apartments", label: "Modern Apartments" },
  { value: "waterfront", label: "Waterfront Estates" },
];

const priceRangeOptions = [
  { value: "any", label: "Any Price Range" },
  { value: "0-1000000", label: "Under $1,000,000" },
  { value: "1000000-3000000", label: "$1,000,000 - $3,000,000" },
  { value: "3000000-5000000", label: "$3,000,000 - $5,000,000" },
  { value: "5000000+", label: "$5,000,000+" },
];

export default function HeroSearchBar({
  onSearchSubmit,
  className = "",
}: HeroSearchBarProps) {
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
  };

  return (
    <div
      className={`w-full max-w-4xl rounded-2xl border border-divider/80 bg-surface/90 p-4 sm:p-6 shadow-floating backdrop-blur-md ${className}`}
    >
      {/* Mode Tabs (Buy / Rent) */}
      <div className="flex gap-2 pb-4 border-b border-divider/60">
        <button
          type="button"
          onClick={() => setTab("buy")}
          className={`rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            tab === "buy"
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-primary hover:bg-background"
          }`}
        >
          Buy Properties
        </button>
        <button
          type="button"
          onClick={() => setTab("rent")}
          className={`rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            tab === "rent"
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-primary hover:bg-background"
          }`}
        >
          Rent Properties
        </button>
      </div>

      {/* Main Search Controls Grid */}
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12 items-end">
        {/* Location Input */}
        <div className="md:col-span-4">
          <Input
            label="Location"
            placeholder="City, Neighborhood, or Zip"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="h-4 w-4" />}
          />
        </div>

        {/* Property Type Dropdown */}
        <div className="md:col-span-3">
          <Select
            label="Property Type"
            options={propertyTypeOptions}
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          />
        </div>

        {/* Price Range Dropdown */}
        <div className="md:col-span-3">
          <Select
            label="Price Range"
            options={priceRangeOptions}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-[42px] flex items-center justify-center gap-2 rounded-lg font-semibold text-xs"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
