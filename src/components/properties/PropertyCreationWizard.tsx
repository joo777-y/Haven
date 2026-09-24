"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Sliders,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Eye,
  UploadCloud,
  FileText,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PropertyImageManager from "./PropertyImageManager";
import {
  LISTING_TYPES,
  PROPERTY_TYPES,
  wizardStep1Schema,
  wizardStep2Schema,
  wizardStep3Schema,
  type PropertyInput,
} from "@/lib/validations/property";
import {
  createPropertyAction,
  updatePropertyAction,
  updatePropertyStatusAction,
} from "@/lib/properties/actions";
import type { PropertyImageRow } from "@/types/property";
import { formatPropertyPrice, formatPropertyArea } from "@/types/property";

const POPULAR_AMENITIES = [
  "Private Swimming Pool",
  "Sea View",
  "Smart Home System",
  "Private Garden",
  "Rooftop Terrace",
  "Fitness Center",
  "Concierge Service",
  "24/7 Security",
  "Private Elevator",
  "Covered Parking",
  "Maid's Quarters",
  "Central Air Conditioning",
  "Panoramic Windows",
  "Jacuzzi / Spa",
];

const STEPS = [
  { id: 1, label: "Core Essentials", icon: Building2 },
  { id: 2, label: "Location", icon: MapPin },
  { id: 3, label: "Specifications", icon: Sliders },
  { id: 4, label: "Media & Gallery", icon: Camera },
  { id: 5, label: "Review & Publish", icon: CheckCircle2 },
];

export default function PropertyCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Wizard Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [propertyType, setPropertyType] = useState<
    "apartment" | "villa" | "studio" | "chalet" | "townhouse" | "penthouse"
  >("villa");

  const [country, setCountry] = useState("Egypt");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState("");

  // Persisted Database Property after Step 3 save
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<PropertyImageRow[]>([]);

  // Validation / Error States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Toggle Popular Amenity
  const toggleAmenity = (item: string) => {
    setFeatures((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  // Add Custom Amenity
  const addCustomAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customFeatureInput.trim();
    if (!trimmed) return;
    if (!features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
    }
    setCustomFeatureInput("");
  };

  // Step 1 Validation
  const validateStep1 = () => {
    setFieldErrors({});
    const res = wizardStep1Schema.safeParse({
      title,
      description,
      price: Number(price),
      listing_type: listingType,
      property_type: propertyType,
    });
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errs);
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    setFieldErrors({});
    const res = wizardStep2Schema.safeParse({
      country,
      city,
      neighborhood: neighborhood || undefined,
      address: address || undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    });
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errs);
      return false;
    }
    return true;
  };

  // Step 3 Validation & Save to Draft
  const validateAndSaveStep3 = async () => {
    setFieldErrors({});
    setGlobalError(null);

    const res = wizardStep3Schema.safeParse({
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      area: area ? Number(area) : undefined,
      parking_spaces: parkingSpaces ? Number(parkingSpaces) : undefined,
      year_built: yearBuilt ? Number(yearBuilt) : undefined,
      features,
    });

    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
      }
      setFieldErrors(errs);
      return false;
    }

    const payload: PropertyInput = {
      title,
      description,
      price: Number(price),
      listing_type: listingType,
      property_type: propertyType,
      country,
      city,
      neighborhood: neighborhood || null,
      address: address || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      area: area ? Number(area) : null,
      parking_spaces: parkingSpaces ? Number(parkingSpaces) : null,
      year_built: yearBuilt ? Number(yearBuilt) : null,
      features,
      status: "draft",
    };

    if (createdPropertyId) {
      // Update existing draft
      const updateRes = await updatePropertyAction(createdPropertyId, payload);
      if (!updateRes.success) {
        setGlobalError(updateRes.error || "Failed to update draft property.");
        return false;
      }
      return true;
    } else {
      // Create new draft
      const createRes = await createPropertyAction(payload);
      if (!createRes.success || !createRes.data) {
        setGlobalError(createRes.error || "Failed to create draft listing.");
        return false;
      }
      setCreatedPropertyId(createRes.data.id);
      setCreatedSlug(createRes.data.slug);
      return true;
    }
  };

  // Advance Stepper
  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      startTransition(async () => {
        const ok = await validateAndSaveStep3();
        if (ok) setCurrentStep(4);
      });
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  // Final Action: Save as Draft
  const handleSaveDraftAndExit = () => {
    router.push("/agent/properties");
  };

  // Final Action: Publish Listing
  const handlePublishListing = () => {
    if (!createdPropertyId) return;

    startTransition(async () => {
      const res = await updatePropertyStatusAction(createdPropertyId, "published");
      if (res.success) {
        router.push("/agent/properties");
      } else {
        setGlobalError(res.error || "Failed to publish listing.");
      }
    });
  };

  const coverImage =
    uploadedImages.find((img) => img.is_cover)?.image_url ||
    uploadedImages[0]?.image_url ||
    "";

  return (
    <div className="space-y-8">
      {/* 1. Progress Stepper */}
      <div className="rounded-2xl border border-divider bg-surface p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-none pb-2 sm:pb-0 gap-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    // Only allow clicking back to completed steps
                    if (s.id < currentStep) setCurrentStep(s.id);
                  }}
                  disabled={s.id > currentStep}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-secondary text-white shadow-xs"
                      : isCompleted
                      ? "bg-secondary/10 text-secondary hover:bg-secondary/20 cursor-pointer"
                      : "bg-surface/50 text-muted opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>
                    {s.id}. {s.label}
                  </span>
                </button>

                {idx < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted/40 shrink-0 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{globalError}</span>
        </div>
      )}

      {/* 2. Step Form Surfaces */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 shadow-xs">
        {/* STEP 1: Core Essentials */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-divider/60 pb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Core Property Essentials
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Define the listing identity, transaction model, and architectural category.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Listing Title *"
                  placeholder="e.g. Modernist Coastal Villa with Private Mooring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={fieldErrors.title}
                  maxLength={150}
                  className="text-xs"
                />
              </div>

              <div>
                <Select
                  label="Listing Type *"
                  value={listingType}
                  onChange={(e) =>
                    setListingType(e.target.value as "sale" | "rent")
                  }
                  options={LISTING_TYPES.map((t) => ({
                    value: t,
                    label: t === "sale" ? "For Sale" : "For Rent",
                  }))}
                />
              </div>

              <div>
                <Select
                  label="Architectural Category *"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  options={PROPERTY_TYPES.map((t) => ({
                    value: t,
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                  }))}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Offering Price (USD) *"
                  type="number"
                  placeholder="e.g. 1750000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  error={fieldErrors.price}
                  min={1}
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Architectural Narrative & Description *
                </label>
                <textarea
                  rows={6}
                  placeholder="Provide an editorial description detailing the design philosophy, finishes, lighting, and exclusivity of this residence..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-divider bg-background p-3 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-secondary/40 leading-relaxed"
                />
                {fieldErrors.description && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Geographic Location */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-divider/60 pb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Location & Geography
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Situate this property within its city, country, and exclusive district.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Country *"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  error={fieldErrors.country}
                  placeholder="Egypt"
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="City / Metropolitan Area *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={fieldErrors.city}
                  placeholder="e.g. New Cairo, El Gouna, Zamalek"
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Exclusive District / Neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  error={fieldErrors.neighborhood}
                  placeholder="e.g. LakeView, Marina District"
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Street Address / Residence Reference"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  error={fieldErrors.address}
                  placeholder="e.g. 14 Palm Avenue"
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Latitude Coordinate (Optional)"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 30.0444"
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Longitude Coordinate (Optional)"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 31.2357"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Specifications & Amenities */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-divider/60 pb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Architectural Specifications & Amenities
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Specify rooms, interior dimensions, and curated luxury features.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <Input
                  label="Bedrooms"
                  type="number"
                  placeholder="e.g. 4"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  min={0}
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Bathrooms"
                  type="number"
                  placeholder="e.g. 5"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  min={0}
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Area (sqm) *"
                  type="number"
                  placeholder="e.g. 480"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  error={fieldErrors.area}
                  min={1}
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Parking Spaces"
                  type="number"
                  placeholder="e.g. 3"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  min={0}
                  className="text-xs"
                />
              </div>

              <div>
                <Input
                  label="Year Built"
                  type="number"
                  placeholder="e.g. 2024"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  min={1800}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Popular Amenities Selection */}
            <div className="space-y-3 pt-4 border-t border-divider/60">
              <label className="text-xs font-semibold text-foreground block">
                Select Luxury Amenities & Features
              </label>

              <div className="flex flex-wrap gap-2">
                {POPULAR_AMENITIES.map((item) => {
                  const isSelected = features.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleAmenity(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "border-secondary bg-secondary/10 text-secondary ring-1 ring-secondary/30"
                          : "border-divider bg-background/50 text-muted hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-muted" />
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amenity Creator */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-foreground block">
                Add Custom Feature Tag
              </label>
              <div className="flex gap-2 max-w-md">
                <Input
                  placeholder="e.g. Japanese Zen Garden, Temperature Cellar"
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={addCustomAmenity}
                  className="text-xs shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Added Features Badges */}
              {features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-xs border border-divider text-foreground"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => toggleAmenity(f)}
                        className="text-muted hover:text-red-500 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Media & Photography */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-divider/60 pb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                High-Resolution Gallery & Photography
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Upload interior and exterior photos. The draft residence has been registered in the database.
              </p>
            </div>

            {createdPropertyId ? (
              <PropertyImageManager
                propertyId={createdPropertyId}
                initialImages={uploadedImages}
                onImagesChange={(imgs) => setUploadedImages(imgs)}
              />
            ) : (
              <div className="p-8 text-center text-muted">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                <p className="text-xs mt-2">Initializing media storage...</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Review & Publish */}
        {currentStep === 5 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="border-b border-divider/60 pb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Review & Publication Desk
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Review how your listing appears before deciding to broadcast it live or keep it in draft.
              </p>
            </div>

            {/* Checklist Quality Audit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-divider bg-surface/50 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Core Information</span>
                </div>
                <p className="text-[11px] text-muted">
                  Title, pricing ({formatPropertyPrice(Number(price), listingType)}), and category registered.
                </p>
              </div>

              <div className="rounded-xl border border-divider bg-surface/50 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Location Set</span>
                </div>
                <p className="text-[11px] text-muted">
                  {city}, {country} {neighborhood ? `(${neighborhood})` : ""}
                </p>
              </div>

              <div className="rounded-xl border border-divider bg-surface/50 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  {uploadedImages.length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Gallery Status</span>
                </div>
                <p className="text-[11px] text-muted">
                  {uploadedImages.length > 0
                    ? `${uploadedImages.length} high-res images attached.`
                    : "No images attached yet. We recommend at least 1 image before publishing."}
                </p>
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted block">
                Catalog Preview
              </span>

              <div className="max-w-md rounded-2xl border border-divider bg-surface overflow-hidden shadow-card">
                <div className="relative aspect-[4/3] w-full bg-background overflow-hidden">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      <Building2 className="h-10 w-10 text-muted/40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" size="md">
                      {listingType === "rent" ? "For Rent" : "For Sale"}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="font-display text-xl font-bold text-primary">
                      {formatPropertyPrice(Number(price), listingType)}
                    </span>
                    <h3 className="font-display text-base font-semibold text-foreground line-clamp-1 mt-0.5">
                      {title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span className="truncate">
                      {neighborhood ? `${neighborhood}, ` : ""}
                      {city}, {country}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-divider flex items-center justify-between text-xs text-muted">
                    <span>{bedrooms || "—"} Beds</span>
                    <span>{bathrooms || "—"} Baths</span>
                    <span>{area ? formatPropertyArea(Number(area)) : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Wizard Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-divider/60 mt-6">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="gap-1.5 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Step</span>
            </Button>
          ) : (
            <Link href="/agent/properties">
              <Button type="button" variant="ghost" size="sm" className="text-xs">
                Cancel
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isPending}
                onClick={handleNext}
                className="gap-2 text-xs shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Draft...</span>
                  </>
                ) : (
                  <>
                    <span>Next Step</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleSaveDraftAndExit}
                  className="text-xs"
                >
                  Save as Draft & Exit
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending}
                  onClick={handlePublishListing}
                  className="gap-2 text-xs shadow-xs"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>Publish Listing</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
