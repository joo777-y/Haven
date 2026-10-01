import Link from "next/link";
import { ArrowRight, Sparkles, Building2, ShieldCheck, Award } from "lucide-react";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import HeroSection, { type HeroPropertyItem } from "@/components/home/HeroSection";
import PropertyGrid from "@/components/properties/PropertyGrid";
import LifestyleCard, {
  type LifestyleCategory,
} from "@/components/home/LifestyleCard";
import AgentCard from "@/components/agents/AgentCard";
import InteractivePropertyGallery, {
  type GalleryPropertyItem,
} from "@/components/home/InteractivePropertyGallery";
import { getPublishedProperties } from "@/lib/properties/queries";
import {
  formatPropertyPrice,
  formatPropertyArea,
  getCoverImageUrl,
  formatPropertyCardData,
  type PropertyWithDetails,
} from "@/types/property";
import type { Property } from "@/components/properties/PropertyCard";
import { mockHomeData } from "@/data/home";
import { mockProperties } from "@/data/properties";
import { mockAgents } from "@/data/agents";

import { getOptimizedImageUrl } from "@/lib/images/getOptimizedImageUrl";

export default async function Home() {
  // Fetch real published properties from Supabase
  let dbProperties: PropertyWithDetails[] = [];
  try {
    const result = await getPublishedProperties({ limit: 30 });
    dbProperties = result.data;
  } catch (err) {
    console.error("Error fetching homepage properties from Supabase:", err);
  }

  // --------------------------------------------------------------------------
  // SECTION 1: Interactive Showcase Gallery (5 Luxury Villas & Chalets)
  // --------------------------------------------------------------------------
  const villas = dbProperties.filter((p) => p.property_type === "villa");
  const chalets = dbProperties.filter((p) => p.property_type === "chalet");
  const otherTypes = dbProperties.filter(
    (p) => p.property_type !== "villa" && p.property_type !== "chalet"
  );

  const showcasePool = [...villas, ...chalets, ...otherTypes];
  const showcaseSelected = (showcasePool.length > 0 ? showcasePool : (mockProperties as any)).slice(0, 5);
  const showcaseIdSet = new Set(showcaseSelected.map((p: any) => p.id));

  // Map real Supabase properties to gallery items (CDN-optimized gallery preset)
  const galleryProperties: GalleryPropertyItem[] = showcaseSelected.map((p: any) => {
    const isDb = "property_images" in p;
    const rawCoverUrl = isDb ? getCoverImageUrl(p.property_images) : p.image;
    const coverUrl = getOptimizedImageUrl(rawCoverUrl, "gallery");
    const formattedPrice = isDb
      ? formatPropertyPrice(Number(p.price), p.listing_type)
      : p.price;
    const formattedArea = isDb && p.area ? formatPropertyArea(p.area) : p.area;
    const locationStr = isDb
      ? [p.neighborhood, p.city, p.country].filter(Boolean).join(", ")
      : p.location;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: formattedPrice,
      location: locationStr,
      city: p.city,
      image: coverUrl,
      beds: p.bedrooms ?? null,
      baths: p.bathrooms ?? null,
      area: formattedArea,
      badge: isDb
        ? p.property_type === "villa"
          ? "Private Villa"
          : p.property_type === "chalet"
          ? "Coastal Chalet"
          : "Exclusive Residence"
        : p.badge,
      listingType: p.listing_type || p.listingType,
      propertyType: p.property_type || p.propertyType,
    };
  });

  // --------------------------------------------------------------------------
  // SECTION 2: Featured Residences (6 COMPLETELY DIFFERENT properties)
  // No repetition of the 5 villas/chalets featured in the carousel
  // --------------------------------------------------------------------------
  const remainingForFeatured = dbProperties.filter((p) => !showcaseIdSet.has(p.id));
  const featuredSelected = (
    remainingForFeatured.length >= 6
      ? remainingForFeatured
      : dbProperties.length > 0
      ? dbProperties
      : (mockProperties as any)
  ).slice(0, 6);

  const featuredProperties: Property[] = featuredSelected.map((p: any) => {
    const isDb = "property_images" in p;
    if (isDb) {
      const formatted = formatPropertyCardData(p, false);
      return {
        id: formatted.id,
        title: formatted.title,
        slug: formatted.slug,
        price: formatted.formattedPrice,
        rawPrice: p.price,
        location: formatted.location,
        image: getOptimizedImageUrl(formatted.coverImage, "card"),
        beds: formatted.bedrooms ?? null,
        baths: formatted.bathrooms ?? null,
        area: formatted.formattedArea,
        listingType: formatted.listingType,
        propertyType: formatted.propertyType,
        agent: formatted.agent,
        latitude: formatted.latitude,
        longitude: formatted.longitude,
        isSaved: false,
      };
    }
    return p;
  });

  // --------------------------------------------------------------------------
  // SECTION 3: Curated Lifestyles with Real Supabase Images
  // --------------------------------------------------------------------------
  const villaSample = villas[0];
  const penthouseSample = dbProperties.find((p) => p.property_type === "penthouse");
  const coastalSample =
    chalets[0] ||
    dbProperties.find((p) => p.city === "North Coast" || p.city === "El Gouna");
  const townhouseSample = dbProperties.find((p) => p.property_type === "townhouse");

  const villaImage = getOptimizedImageUrl(
    villaSample
      ? getCoverImageUrl(villaSample.property_images)
      : "https://afxgijkdaaidklzhwell.supabase.co/storage/v1/object/public/property-images/b1061111-1111-4111-8111-111111111111/cover1.jpg",
    "card"
  );
  const penthouseImage = getOptimizedImageUrl(
    penthouseSample
      ? getCoverImageUrl(penthouseSample.property_images)
      : "https://afxgijkdaaidklzhwell.supabase.co/storage/v1/object/public/property-images/a1041111-1111-4111-8111-111111111111/cover1.jpg",
    "card"
  );
  const coastalImage = getOptimizedImageUrl(
    coastalSample
      ? getCoverImageUrl(coastalSample.property_images)
      : "https://afxgijkdaaidklzhwell.supabase.co/storage/v1/object/public/property-images/a1061111-1111-4111-8111-111111111111/cover1.jpg",
    "card"
  );
  const townhouseImage = getOptimizedImageUrl(
    townhouseSample
      ? getCoverImageUrl(townhouseSample.property_images)
      : "https://afxgijkdaaidklzhwell.supabase.co/storage/v1/object/public/property-images/a1031111-1111-4111-8111-111111111111/cover1.jpg",
    "card"
  );

  const lifestyleCategories: LifestyleCategory[] = [
    {
      id: "cat-villas",
      title: "Modern Villas & Estates",
      slug: "villa",
      href: "/properties?category=villa",
      image: villaImage,
      listingCount: villas.length || 4,
      description: "Private sanctuaries with expansive landscaped grounds, signature architecture, and secluded comfort.",
    },
    {
      id: "cat-penthouses",
      title: "Penthouses & Sky Lofts",
      slug: "penthouse",
      href: "/properties?category=penthouse",
      image: penthouseImage,
      listingCount:
        dbProperties.filter(
          (p) => p.property_type === "penthouse" || p.title.toLowerCase().includes("loft")
        ).length || 3,
      description: "Panoramic sky-high residences with soaring ceilings, private terraces, and sweeping horizons.",
    },
    {
      id: "cat-coastal",
      title: "Coastal Sanctuaries",
      slug: "chalet",
      href: "/properties?category=chalet",
      image: coastalImage,
      listingCount:
        dbProperties.filter(
          (p) =>
            p.property_type === "chalet" ||
            p.city === "North Coast" ||
            p.city === "El Gouna"
        ).length || 4,
      description: "Direct waterfront chalets and Mediterranean estates tailored for elevated resort-style living.",
    },
    {
      id: "cat-townhouses",
      title: "Townhouses & Residences",
      slug: "townhouse",
      href: "/properties?category=townhouse",
      image: townhouseImage,
      listingCount:
        dbProperties.filter(
          (p) => p.property_type === "townhouse" || p.property_type === "apartment"
        ).length || 5,
      description: "Multi-level family masterworks and executive residences situated within prime gated communities.",
    },
  ];

  const featuredAgents = mockAgents.filter((a) =>
    mockHomeData.featuredAgentIds.includes(a.id)
  );

  // --------------------------------------------------------------------------
  // HERO SHOWCASE: 3 Premier Architectural Showcase Residences
  // --------------------------------------------------------------------------
  const heroShowcaseProperties: HeroPropertyItem[] = showcaseSelected.slice(0, 3).map((p: any) => {
    const isDb = "property_images" in p;
    const rawCoverUrl = isDb ? getCoverImageUrl(p.property_images) : p.image;
    const coverUrl = getOptimizedImageUrl(rawCoverUrl, "hero");
    const formattedPrice = isDb
      ? formatPropertyPrice(Number(p.price), p.listing_type)
      : p.price;
    const formattedArea = isDb && p.area ? formatPropertyArea(p.area) : p.area;
    const locationStr = isDb
      ? [p.neighborhood, p.city, p.country].filter(Boolean).join(", ")
      : p.location;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: formattedPrice,
      location: locationStr,
      city: p.city,
      image: coverUrl,
      beds: p.bedrooms ?? (p.beds || null),
      baths: p.bathrooms ?? (p.baths || null),
      area: formattedArea,
      badge: isDb
        ? p.property_type === "villa"
          ? "Private Architectural Villa"
          : p.property_type === "chalet"
          ? "Coastal Sanctuary"
          : "Featured Residence"
        : p.badge || "Featured Residence",
      listingType: p.listing_type || p.listingType || "sale",
      propertyType: p.property_type || p.propertyType || "villa",
      tagline: `${p.city || "Sanctuary"} · Architectural Masterpiece`,
    };
  });

  return (
    <div className="space-y-24 pb-20">
      {/* Redesigned Architectural Hero Section */}
      <HeroSection
        showcaseProperties={heroShowcaseProperties}
        stats={mockHomeData.stats}
      />

      {/* Interactive Architectural Showcase Gallery */}
      <section>
        <Container>
          <SectionHeading
            subtitle="Interactive Showcase"
            title="The Haven Architectural Gallery"
            description="Experience our premier residences through an expandable showcase. Select any preview to expand the residence into focus."
            action={
              <Link href="/properties">
                <Button variant="outline" size="md">
                  <span>Explore Portfolio</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />

          <InteractivePropertyGallery properties={galleryProperties} />
        </Container>
      </section>

      {/* Featured Properties Section */}
      <section>
        <Container>
          <SectionHeading
            subtitle="Curated Portfolio"
            title="Featured Residences & Estates"
            description="Hand-selected architectural sanctuaries offering extraordinary design and unmatched locations."
            action={
              <Link href="/properties">
                <Button variant="outline" size="md">
                  <span>View All Properties</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />

          <PropertyGrid properties={featuredProperties} />
        </Container>
      </section>

      {/* Explore by Architecture & Lifestyle */}
      <section className="bg-surface py-20 border-y border-divider/60">
        <Container>
          <SectionHeading
            subtitle="Curated Lifestyles"
            title="Explore by Architecture & Living"
            description="Discover homes crafted for your lifestyle—from mid-century modernist icons to oceanfront retreats."
            align="left"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifestyleCategories.map((category) => (
              <LifestyleCard key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Agents Section */}
      <section>
        <Container>
          <SectionHeading
            subtitle="Advisory Excellence"
            title="Meet Our Principal Advisors"
            description="Licensed private brokers specializing in architectural preservation, waterfront acquisitions, and off-market luxury."
            action={
              <Link href="/agents">
                <Button variant="outline" size="md">
                  <span>View All Advisors</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonial / Brand Trust Section */}
      <section className="bg-[#1e2022] text-white py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Sparkles className="h-8 w-8 text-secondary mx-auto" />
            <blockquote className="font-display text-2xl sm:text-3xl font-normal leading-relaxed italic text-surface/90">
              "{mockHomeData.testimonials[0].quote}"
            </blockquote>
            <div>
              <h5 className="font-sans text-sm font-semibold text-white">
                {mockHomeData.testimonials[0].author}
              </h5>
              <p className="font-sans text-xs text-secondary mt-0.5">
                {mockHomeData.testimonials[0].role} • {mockHomeData.testimonials[0].location}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Call to Action Banner */}
      <section>
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-secondary/10 border border-secondary/20 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <Badge variant="secondary" size="md">
                Private Advisory
              </Badge>
              <h3 className="font-display text-3xl font-semibold text-primary">
                Are you looking to acquire or sell an architectural masterpiece?
              </h3>
              <p className="font-sans text-sm text-muted leading-relaxed">
                Connect with our concierge team for confidential consultations and exclusive off-market listings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  <span>Contact Advisory Team</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" size="lg">
                  Browse Listings
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}