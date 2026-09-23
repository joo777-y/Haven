import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PropertyForm from "@/components/properties/PropertyForm";

export const metadata: Metadata = {
  title: "Create New Listing | HAVEN Advisor",
  description: "Register a new architectural residence in draft status.",
};

export default function NewPropertyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/agent/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Listing Portfolio</span>
        </Link>

        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Create Property Listing
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Enter architectural details, dimensions, and amenities. New listings
            start as <span className="font-medium text-amber-600">Draft</span> and
            can be published whenever you are ready.
          </p>
        </div>
      </div>

      {/* Property Form */}
      <PropertyForm mode="create" />
    </div>
  );
}
