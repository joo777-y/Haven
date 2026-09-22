"use client";

import { use, useState } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PropertyGrid from "@/components/properties/PropertyGrid";
import AgentCard from "@/components/agents/AgentCard";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { mockProperties } from "@/data/properties";
import { mockAgents } from "@/data/agents";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Car,
  CheckCircle2,
  Heart,
  Share2,
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";

export default function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const property = mockProperties.find((p) => p.slug === slug) || mockProperties[0];
  const agent = mockAgents.find((a) => a.id === property.agentId) || mockAgents[0];
  const similarProperties = mockProperties
    .filter((p) => p.id !== property.id)
    .slice(0, 3);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setIsInquiryModalOpen(false);
    }, 2000);
  };

  return (
    <div className="py-10 space-y-12">
      <Container>
        {/* Back Button */}
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Properties Catalog</span>
        </Link>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-divider">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary">{property.badge || "Exclusive"}</Badge>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                {property.listingType === "rent" ? "For Rent" : "For Sale"}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-primary">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted mt-2">
              <MapPin className="h-4 w-4 text-secondary shrink-0" />
              <span>{property.location}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div>
              <span className="text-xs text-muted block">Price</span>
              <span className="font-display text-3xl font-bold text-primary">
                {property.price}
                {property.listingType === "rent" && (
                  <span className="text-sm font-normal text-muted font-sans ml-1">/ mo</span>
                )}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
                className="gap-1.5"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isSaved ? "fill-secondary text-secondary" : ""
                  }`}
                />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 aspect-[16/10] overflow-hidden rounded-2xl border border-divider bg-background">
            <img
              src={selectedImage || property.image}
              alt={property.title}
              className="h-full w-full object-cover transition-all duration-300"
            />
          </div>

          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto">
            {property.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-[4/3] w-24 md:w-full overflow-hidden rounded-xl border transition-all cursor-pointer ${
                  (selectedImage || property.image) === img
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-divider opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Key Specs Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 rounded-2xl border border-divider bg-surface p-6 text-center">
          <div className="space-y-1">
            <Bed className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Bedrooms</span>
            <span className="font-sans text-base font-bold text-primary">{property.beds} Beds</span>
          </div>
          <div className="space-y-1">
            <Bath className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Bathrooms</span>
            <span className="font-sans text-base font-bold text-primary">{property.baths} Baths</span>
          </div>
          <div className="space-y-1">
            <Maximize2 className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Total Area</span>
            <span className="font-sans text-base font-bold text-primary">{property.area}</span>
          </div>
          <div className="space-y-1">
            <Calendar className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Year Built</span>
            <span className="font-sans text-base font-bold text-primary">{property.yearBuilt}</span>
          </div>
          <div className="space-y-1">
            <Car className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Parking</span>
            <span className="font-sans text-base font-bold text-primary">{property.parkingSpaces} Spaces</span>
          </div>
          <div className="space-y-1">
            <CheckCircle2 className="h-5 w-5 text-secondary mx-auto" />
            <span className="text-xs text-muted block">Status</span>
            <span className="font-sans text-base font-bold text-primary">Active</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Description & Features */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview & Description */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-semibold text-primary">
                Architectural Narrative
              </h3>
              <p className="font-sans text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features & Amenities */}
            <div className="space-y-4 pt-6 border-t border-divider">
              <h3 className="font-display text-2xl font-semibold text-primary">
                Features & Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Agent Contact Box */}
          <div className="space-y-6">
            <div className="sticky top-28 rounded-2xl border border-divider bg-surface p-6 space-y-6 shadow-xs">
              <h4 className="font-display text-lg font-semibold text-primary">
                Listing Advisor
              </h4>

              <AgentCard agent={agent} />

              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setIsInquiryModalOpen(true)}
              >
                <Mail className="h-4 w-4" />
                <span>Inquire About This Property</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        <div className="mt-24 pt-12 border-t border-divider space-y-8">
          <h3 className="font-display text-2xl font-semibold text-primary">
            Similar Residences
          </h3>
          <PropertyGrid properties={similarProperties} />
        </div>
      </Container>

      {/* Inquiry Modal */}
      <Modal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        title="Schedule a Private Viewing"
        description={`Direct inquiry to ${agent.name} regarding ${property.title}`}
      >
        {inquirySubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-secondary mx-auto" />
            <h4 className="font-display text-lg font-semibold text-foreground">
              Inquiry Sent Successfully!
            </h4>
            <p className="text-xs text-muted">
              {agent.name} will contact you directly within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" required />
            <Input label="Email Address" type="email" placeholder="john@example.com" required />
            <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
            <div className="space-y-1.5">
              <label className="block font-sans text-xs font-semibold text-primary">
                Message
              </label>
              <textarea
                rows={3}
                defaultValue={`I would like to request a private showing or additional information for ${property.title}.`}
                className="w-full rounded-lg border border-divider bg-surface p-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full gap-2">
              <Send className="h-4 w-4" />
              <span>Send Inquiry</span>
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}