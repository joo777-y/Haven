import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import AgentPropertyManager from "@/components/properties/AgentPropertyManager";
import { getAgentProperties } from "@/lib/properties/queries";

export const metadata: Metadata = {
  title: "My Listings Portfolio | HAVEN Advisor",
  description: "Manage, publish, edit, and archive your property listings.",
};

export default async function AgentPropertiesPage() {
  // Fetch properties owned exclusively by this authenticated advisor
  const properties = await getAgentProperties();

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/agent"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Advisor Portal</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Listing Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Manage, edit, publish, and archive your luxury architectural listings.
            </p>
          </div>

          <Link href="/agent/properties/new">
            <Button variant="secondary" size="md" className="gap-2 text-xs shadow-xs">
              <PlusCircle className="h-4 w-4" />
              <span>Add New Property</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Inventory Manager with Search & Filters */}
      <AgentPropertyManager initialProperties={properties} />
    </div>
  );
}
