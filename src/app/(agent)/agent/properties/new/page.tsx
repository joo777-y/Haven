import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PropertyCreationWizard from "@/components/properties/PropertyCreationWizard";

export const metadata: Metadata = {
  title: "Create New Listing | HAVEN Advisor",
  description:
    "Guided 5-step listing creator: essentials, location, specs, photography, and review.",
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
          <span>Back to Listing Portfolio</span>
        </Link>

        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Create Property Listing
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Guided 5-step workflow to craft an architectural residence listing, attach media, and broadcast to prospective buyers.
          </p>
        </div>
      </div>

      {/* Guided 5-Step Creation Wizard */}
      <PropertyCreationWizard />
    </div>
  );
}
