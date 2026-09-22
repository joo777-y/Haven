"use client";

import { useState, useMemo } from "react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import PropertyGrid from "@/components/properties/PropertyGrid";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { mockProperties } from "@/data/properties";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Sort by: Newest Listed" },
  { value: "price-asc", label: "Sort by: Price (Low to High)" },
  { value: "price-desc", label: "Sort by: Price (High to Low)" },
];

const listingTypeOptions = [
  { value: "all", label: "All Listing Types" },
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

const bedOptions = [
  { value: "any", label: "Any Bedrooms" },
  { value: "3", label: "3+ Bedrooms" },
  { value: "4", label: "4+ Bedrooms" },
  { value: "5", label: "5+ Bedrooms" },
];

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listingType, setListingType] = useState("all");
  const [minBeds, setMinBeds] = useState("any");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter & Sort Logic (Client-side)
  const filteredProperties = useMemo(() => {
    return mockProperties
      .filter((property) => {
        // Search Filter
        const matchesQuery =
          searchQuery.trim() === "" ||
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Listing Type Filter
        const matchesType =
          listingType === "all" || property.listingType === listingType;

        // Bedrooms Filter
        const matchesBeds =
          minBeds === "any" || property.beds >= parseInt(minBeds, 10);

        return matchesQuery && matchesType && matchesBeds;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, ""), 10);
          const priceB = parseInt(b.price.replace(/[^0-9]/g, ""), 10);
          return priceA - priceB;
        }
        if (sortBy === "price-desc") {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, ""), 10);
          const priceB = parseInt(b.price.replace(/[^0-9]/g, ""), 10);
          return priceB - priceA;
        }
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [searchQuery, listingType, minBeds, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(start, start + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setListingType("all");
    setMinBeds("any");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="py-12 space-y-10">
      <Container>
        <SectionHeading
          subtitle="Real Estate Catalog"
          title="Explore Architectural Properties"
          description="Filter our curated collection by location, price, and specs to find your next sanctuary."
        />

        {/* Filter Controls Panel */}
        <div className="rounded-2xl border border-divider bg-surface p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-end">
            {/* Search Input */}
            <div className="md:col-span-5">
              <Input
                label="Search Keyword"
                placeholder="Search by city, title, or address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search className="h-4 w-4 text-muted" />}
              />
            </div>

            {/* Listing Type Select */}
            <div className="md:col-span-3">
              <Select
                label="Type"
                options={listingTypeOptions}
                value={listingType}
                onChange={(e) => {
                  setListingType(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Bedrooms Select */}
            <div className="md:col-span-2">
              <Select
                label="Bedrooms"
                options={bedOptions}
                value={minBeds}
                onChange={(e) => {
                  setMinBeds(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Reset Button */}
            <div className="md:col-span-2">
              <Button
                variant="outline"
                size="md"
                className="w-full h-[42px] flex items-center justify-center gap-1.5 text-xs"
                onClick={handleResetFilters}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            </div>
          </div>

          {/* Bar Bottom - Active Counts & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-divider/60">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>Showing</span>
              <Badge variant="secondary" size="sm">
                {filteredProperties.length} Properties
              </Badge>
            </div>

            <div className="w-full sm:w-64">
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Property Grid Display */}
        <div className="mt-8">
          <PropertyGrid properties={paginatedProperties} />
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-9 w-9 rounded-lg font-sans text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-primary text-white"
                      : "bg-surface text-muted hover:bg-background border border-divider"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}