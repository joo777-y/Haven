import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyForm from "@/components/properties/PropertyForm";
import PropertyImageManager from "@/components/properties/PropertyImageManager";
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

          <div className="self-start sm:self-auto">
            {property.status === "published" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Published
              </span>
            )}
            {property.status === "draft" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Draft
              </span>
            )}
            {property.status === "archived" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-3 py-1 text-xs font-semibold text-gray-500 border border-gray-500/20">
                Archived
              </span>
            )}
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
