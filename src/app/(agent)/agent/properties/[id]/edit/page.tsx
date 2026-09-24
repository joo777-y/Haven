import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyForm from "@/components/properties/PropertyForm";
import PropertyImageManager from "@/components/properties/PropertyImageManager";
import AgentPropertyActions from "@/components/properties/AgentPropertyActions";
import { getPropertyForEdit } from "@/lib/properties/queries";

export const metadata: Metadata = {
  title: "Edit Property Listing | HAVEN Advisor",
  description: "Update property specifications and amenities.",
};

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const { id } = await params;

  // Server-side fetch with strict agent ownership check (agent_id = user's agent id)
  const property = await getPropertyForEdit(id);

  if (!property) {
    notFound();
  }

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Edit Listing
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Updating architectural specifications for{" "}
              <span className="font-semibold text-foreground">
                {property.title}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AgentPropertyActions
              propertyId={property.id}
              slug={property.slug}
              status={property.status}
            />
          </div>
        </div>
      </div>

      {/* Photography & Gallery Management */}
      <PropertyImageManager
        propertyId={property.id}
        initialImages={property.property_images || []}
      />

      {/* Property Form Pre-populated */}
      <PropertyForm mode="edit" initialData={property} />
    </div>
  );
}
