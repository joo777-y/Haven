"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  type PropertyInput,
} from "@/lib/validations/property";
import type { PropertyWithDetails } from "@/types/property";
import {
  createPropertyAction,
  updatePropertyAction,
} from "@/lib/properties/actions";

const listingTypeOptions = LISTING_TYPES.map((t) => ({
  value: t,
  label: t === "sale" ? "For Sale" : "For Rent",
}));

const propertyTypeOptions = PROPERTY_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

interface PropertyFormProps {
  initialData?: PropertyWithDetails | null;
  mode: "create" | "edit";
}

export default function PropertyForm({
  initialData,
  mode,
}: PropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [price, setPrice] = useState(
    initialData ? String(initialData.price) : ""
  );
  const [listingType, setListingType] = useState<"sale" | "rent">(
    (initialData?.listing_type as "sale" | "rent") || "sale"
  );
  const [propertyType, setPropertyType] = useState(
    initialData?.property_type || "villa"
  );
  const [bedrooms, setBedrooms] = useState(
    initialData?.bedrooms !== null && initialData?.bedrooms !== undefined
      ? String(initialData.bedrooms)
      : ""
  );
  const [bathrooms, setBathrooms] = useState(
    initialData?.bathrooms !== null && initialData?.bathrooms !== undefined
      ? String(initialData.bathrooms)
      : ""
  );
  const [area, setArea] = useState(
    initialData?.area !== null && initialData?.area !== undefined
      ? String(initialData.area)
      : ""
  );
  const [parkingSpaces, setParkingSpaces] = useState(
    initialData?.parking_spaces !== null &&
      initialData?.parking_spaces !== undefined
      ? String(initialData.parking_spaces)
      : ""
  );
  const [yearBuilt, setYearBuilt] = useState(
    initialData?.year_built !== null && initialData?.year_built !== undefined
      ? String(initialData.year_built)
      : ""
  );
  const [country, setCountry] = useState(initialData?.country || "Egypt");
  const [city, setCity] = useState(initialData?.city || "");
  const [neighborhood, setNeighborhood] = useState(
    initialData?.neighborhood || ""
  );
  const [address, setAddress] = useState(initialData?.address || "");
  const [latitude, setLatitude] = useState(
    initialData?.latitude !== null && initialData?.latitude !== undefined
      ? String(initialData.latitude)
      : ""
  );
  const [longitude, setLongitude] = useState(
    initialData?.longitude !== null && initialData?.longitude !== undefined
      ? String(initialData.longitude)
      : ""
  );

  // Features list state
  const initialFeatures =
    initialData?.property_features?.map((f) => f.feature) || [];
  const [features, setFeatures] = useState<string[]>(initialFeatures);
  const [featureInput, setFeatureInput] = useState("");

  // Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddFeature = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (feat: string) => {
    setFeatures(features.filter((f) => f !== feat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic required check
    if (!title.trim() || !description.trim() || !city.trim() || !price) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const payload: PropertyInput = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      listing_type: listingType,
      property_type: propertyType as PropertyInput["property_type"],
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      area: area ? Number(area) : null,
      parking_spaces: parkingSpaces ? Number(parkingSpaces) : null,
      year_built: yearBuilt ? Number(yearBuilt) : null,
      country: country.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim() || null,
      address: address.trim() || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      status: initialData?.status || "draft",
      features,
    };

    startTransition(async () => {
      if (mode === "create") {
        const res = await createPropertyAction(payload);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to create listing.");
        } else {
          setSuccessMessage("Listing created as Draft. Redirecting to media manager...");
          setTimeout(() => {
            if (res.data?.id) {
              router.push(`/agent/properties/${res.data.id}/edit`);
            } else {
              router.push("/agent/properties");
            }
          }, 1000);
        }
      } else {
        if (!initialData?.id) return;
        const res = await updatePropertyAction(initialData.id, payload);
        if (!res.success) {
          setErrorMessage(res.error || "Failed to update listing.");
        } else {
          setSuccessMessage("Listing updated successfully!");
          setTimeout(() => {
            router.push("/agent/properties");
          }, 1000);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Alert Notices */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs sm:text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Core Property Information */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-divider pb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            1. Core Information
          </h2>
          <p className="text-xs text-muted mt-1">
            Define the identity, category, and pricing of the residence.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Property Title *"
            placeholder="e.g. Modernist Coastal Villa with Panoramic Sea Views"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-semibold text-primary">
              Architectural Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe the architectural concept, materials, and living experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-divider bg-surface p-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price ($ USD) *"
              type="number"
              min="0"
              step="1000"
              placeholder="1200000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <Select
              label="Listing Type *"
              options={listingTypeOptions}
              value={listingType}
              onChange={(e) =>
                setListingType(e.target.value as "sale" | "rent")
              }
            />

            <Select
              label="Property Category *"
              options={propertyTypeOptions}
              value={propertyType}
              onChange={(e) =>
                setPropertyType(e.target.value as PropertyInput["property_type"])
              }
            />
          </div>
        </div>
      </div>

      {/* 2. Specifications & Dimensions */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-divider pb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            2. Specifications & Dimensions
          </h2>
          <p className="text-xs text-muted mt-1">
            Specify rooms, usable surface area, and construction metrics.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <Input
            label="Bedrooms"
            type="number"
            min="0"
            placeholder="4"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />

          <Input
            label="Bathrooms"
            type="number"
            min="0"
            placeholder="3"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
          />

          <Input
            label="Area (sqm)"
            type="number"
            min="0"
            placeholder="350"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />

          <Input
            label="Parking Spaces"
            type="number"
            min="0"
            placeholder="2"
            value={parkingSpaces}
            onChange={(e) => setParkingSpaces(e.target.value)}
          />

          <Input
            label="Year Built"
            type="number"
            min="1800"
            max={new Date().getFullYear() + 5}
            placeholder="2024"
            value={yearBuilt}
            onChange={(e) => setYearBuilt(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Location Details */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-divider pb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            3. Location & Address
          </h2>
          <p className="text-xs text-muted mt-1">
            Define city, neighborhood, and optional GPS coordinates.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Country *"
              placeholder="Egypt"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />

            <Input
              label="City *"
              placeholder="e.g. El Gouna, Cairo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <Input
              label="Neighborhood"
              placeholder="e.g. Marina District, Zamalek"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </div>

          <Input
            label="Street Address / Building"
            placeholder="Optional precise address for internal records"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Latitude (Optional)"
              type="number"
              step="any"
              placeholder="27.3949"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />

            <Input
              label="Longitude (Optional)"
              type="number"
              step="any"
              placeholder="33.6766"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 4. Features & Amenities */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-divider pb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            4. Features & Amenities
          </h2>
          <p className="text-xs text-muted mt-1">
            Highlight distinctive qualities (e.g. Private Pool, Floor-to-Ceiling Windows, Solar Powered).
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Type a feature name and click Add..."
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => handleAddFeature()}
              className="gap-1.5 text-xs h-[42px]"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>

          {/* Active Features Badges */}
          {features.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {features.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-divider bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(feat)}
                    className="text-muted hover:text-red-500 cursor-pointer"
                    title={`Remove ${feat}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted/60 italic">
              No features added yet. Type an amenity above to attach tags.
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-divider">
        <Link href="/agent/properties">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="w-full sm:w-auto gap-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
        </Link>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isPending}
          className="w-full sm:w-auto gap-2 text-xs"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>
            {mode === "create" ? "Create Listing (Draft)" : "Save Changes"}
          </span>
        </Button>
      </div>
    </form>
  );
}
