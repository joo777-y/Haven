import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PropertyGrid from "@/components/properties/PropertyGrid";
import PropertyGallery from "@/components/properties/PropertyGallery";
import FavoriteButton from "@/components/properties/FavoriteButton";
import SaveToCollectionButton from "@/components/collections/SaveToCollectionButton";
import ContactAgentForm from "@/components/properties/ContactAgentForm";
import type { Property } from "@/components/properties/PropertyCard";
import {
  getPropertyBySlug,
  getSimilarProperties,
  getUserFavoritePropertyIds,
} from "@/lib/properties/queries";
import {
  formatPropertyPrice,
  formatPropertyArea,
  formatPropertyCardData,
  getCoverImageUrl,
} from "@/types/property";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Car,
  CheckCircle2,
  ArrowLeft,
  Building,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface PropertyDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropertyDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property Not Found | HAVEN",
      description: "The requested architectural property could not be found.",
    };
  }

  const coverUrl = getCoverImageUrl(property.property_images, "");

  return {
    title: `${property.title} | HAVEN Luxury Real Estate`,
    description:
      property.description.slice(0, 160) ||
      `Explore ${property.title}, a luxury ${property.property_type} in ${property.city}.`,
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: coverUrl ? [{ url: coverUrl }] : [],
    },
  };
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { slug } = await params;

  // Fetch the property via Step 1 Data Access Layer (enforces status = 'published')
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Fetch similar properties and user favorite IDs in parallel
  const [similarProperties, userFavoriteIds] = await Promise.all([
    getSimilarProperties(
      property.id,
      property.property_type,
      property.city,
      3
    ),
    getUserFavoritePropertyIds(),
  ]);

  const favoriteIdSet = new Set(userFavoriteIds);
  const isCurrentSaved = favoriteIdSet.has(property.id);

  const similarCards: Property[] = similarProperties.map((p) => {
    const isSaved = favoriteIdSet.has(p.id);
    const formatted = formatPropertyCardData(p, isSaved);
    return {
      id: formatted.id,
      title: formatted.title,
      slug: formatted.slug,
      price: formatted.formattedPrice,
      location: formatted.location,
      image: formatted.coverImage,
      beds: formatted.bedrooms,
      baths: formatted.bathrooms,
      area: formatted.formattedArea,
      listingType: formatted.listingType,
      propertyType: formatted.propertyType,
      agent: formatted.agent,
      isSaved,
    };
  });

  const location =
    [property.neighborhood, property.city, property.country]
      .filter(Boolean)
      .join(", ") ||
    property.city ||
    "HAVEN Portfolio";

  const formattedPrice = formatPropertyPrice(
    property.price,
    property.listing_type
  );
  const formattedArea = formatPropertyArea(property.area);

  // Safe agent projection from agents_public
  const agent = property.agents_public;

  return (
    <div className="py-10 space-y-12">
      <Container>
        {/* Navigation Breadcrumb */}
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Properties Catalog</span>
        </Link>

        {/* Title & Price Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-divider">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="secondary" size="md" className="font-semibold">
                {property.listing_type === "rent" ? "For Rent" : "For Sale"}
              </Badge>
              <Badge
                variant="surface"
                size="md"
                className="capitalize text-muted font-medium"
              >
                {property.property_type}
              </Badge>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-4 w-4 text-secondary shrink-0" />
              <span>{location}</span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <div>
              <span className="text-xs text-muted font-medium uppercase tracking-wider block">
                Offering Price
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                {formattedPrice}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <SaveToCollectionButton
                propertyId={property.id}
                propertyTitle={property.title}
                variant="button"
                showLabel
              />
              <FavoriteButton
                propertyId={property.id}
                initialIsSaved={isCurrentSaved}
                variant="button"
                showLabel
              />
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="mt-8">
          <PropertyGallery
            images={property.property_images || []}
            title={property.title}
          />
        </div>

        {/* Key Architectural Specs Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 rounded-2xl border border-divider bg-surface p-6 text-center shadow-xs">
          <div className="space-y-1">
            <Bed className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Bedrooms</span>
            <span className="font-sans text-base font-bold text-primary">
              {property.bedrooms !== null ? `${property.bedrooms} Beds` : "—"}
            </span>
          </div>

          <div className="space-y-1">
            <Bath className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Bathrooms</span>
            <span className="font-sans text-base font-bold text-primary">
              {property.bathrooms !== null ? `${property.bathrooms} Baths` : "—"}
            </span>
          </div>

          <div className="space-y-1">
            <Maximize2 className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Total Area</span>
            <span className="font-sans text-base font-bold text-primary">
              {formattedArea}
            </span>
          </div>

          <div className="space-y-1">
            <Calendar className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Year Built</span>
            <span className="font-sans text-base font-bold text-primary">
              {property.year_built ?? "—"}
            </span>
          </div>

          <div className="space-y-1">
            <Car className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Parking</span>
            <span className="font-sans text-base font-bold text-primary">
              {property.parking_spaces !== null
                ? `${property.parking_spaces} Spaces`
                : "—"}
            </span>
          </div>

          <div className="space-y-1">
            <ShieldCheck className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Status</span>
            <span className="font-sans text-base font-bold text-primary capitalize">
              {property.status}
            </span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Description & Features */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview / Narrative */}
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-semibold text-primary">
                Architectural Narrative
              </h2>
              <p className="font-sans text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features & Amenities */}
            <div className="space-y-4 pt-8 border-t border-divider">
              <h2 className="font-display text-2xl font-semibold text-primary">
                Features & Amenities
              </h2>
              {property.property_features &&
              property.property_features.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {property.property_features.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 rounded-lg border border-divider/60 bg-surface/40 p-3 text-sm text-foreground shadow-2xs"
                    >
                      <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                      <span>{item.feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-muted/70 italic">
                  No specific feature tags are registered for this residence.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Safe Advisor Contact Card */}
          <div className="space-y-6">
            <div className="sticky top-28 rounded-2xl border border-divider bg-surface p-6 space-y-6 shadow-xs">
              <h3 className="font-display text-lg font-semibold text-primary">
                Listing Advisor
              </h3>

              {agent ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {agent.avatar_url ? (
                      <img
                        src={agent.avatar_url}
                        alt={agent.full_name}
                        className="h-16 w-16 shrink-0 rounded-full object-cover border border-divider shadow-xs"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-display text-xl font-bold text-secondary border border-secondary/20">
                        {agent.full_name.charAt(0)}
                      </div>
                    )}

                    {/* Agent Public Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-lg font-semibold text-foreground truncate">
                        {agent.full_name}
                      </h4>
                      <p className="font-sans text-xs text-muted truncate mt-0.5">
                        {agent.professional_title || "Licensed Real Estate Advisor"}
                      </p>
                      {agent.company_name && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-secondary font-medium">
                          <Building className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{agent.company_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="text-xs text-muted/80 leading-relaxed border-t border-divider/60 pt-3 line-clamp-3">
                      {agent.bio}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    HAVEN Concierge
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    Represented directly through the HAVEN private advisory desk.
                  </p>
                </div>
              )}

              {/* Contact Agent / Inquiry Form */}
              <ContactAgentForm
                propertyId={property.id}
                propertyTitle={property.title}
                agentName={agent?.full_name}
              />
            </div>
          </div>
        </div>

        {/* Similar Residences Section */}
        {similarCards.length > 0 && (
          <div className="mt-24 pt-12 border-t border-divider space-y-8">
            <div className="space-y-1">
              <span className="font-display text-xs uppercase tracking-widest text-secondary font-semibold">
                Curated Recommendations
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-primary">
                Similar Residences
              </h3>
            </div>
            <PropertyGrid properties={similarCards} />
          </div>
        )}
      </Container>
    </div>
  );
}