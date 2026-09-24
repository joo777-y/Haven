import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAgentInquiries } from "@/lib/properties/queries";
import AgentInquiryManager from "@/components/inquiries/AgentInquiryManager";

export const metadata: Metadata = {
  title: "Client Inquiries | HAVEN Advisor",
  description: "Manage and resolve buyer inquiries for your property listings.",
};

export default async function AgentInquiriesPage() {
  const inquiries = await getAgentInquiries();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
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
              Client Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Review messages, filter by lead status, and manage resolution for your architectural listings.
            </p>
          </div>
        </div>
      </div>

      {/* Filterable Inquiries Manager */}
      <AgentInquiryManager initialInquiries={inquiries} />
    </div>
  );
}
