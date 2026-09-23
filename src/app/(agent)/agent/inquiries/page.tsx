import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageSquare, Building2, User, Clock, CheckCircle2 } from "lucide-react";
import { getAgentInquiries } from "@/lib/properties/queries";
import { formatPropertyPrice, getCoverImageUrl } from "@/types/property";
import InquiryStatusControl from "@/components/inquiries/InquiryStatusControl";

export const metadata: Metadata = {
  title: "Client Inquiries | HAVEN Advisor",
  description: "Manage and resolve buyer inquiries for your property listings.",
};

export default async function AgentInquiriesPage() {
  const inquiries = await getAgentInquiries();

  const newCount = inquiries.filter((i) => i.status === "new").length;
  const contactedCount = inquiries.filter((i) => i.status === "contacted").length;
  const closedCount = inquiries.filter((i) => i.status === "closed").length;

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
              Review messages and manage lead resolution for your architectural residences.
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-3 pt-2 flex-wrap text-xs">
          <div className="rounded-lg border border-divider bg-surface px-3 py-1.5 flex items-center gap-2">
            <span className="text-muted">Total Inquiries:</span>
            <span className="font-semibold text-foreground">{inquiries.length}</span>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-700 dark:text-amber-400 font-medium">New:</span>
            <span className="font-semibold text-amber-800 dark:text-amber-300">{newCount}</span>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-blue-700 dark:text-blue-400 font-medium">Contacted:</span>
            <span className="font-semibold text-blue-800 dark:text-blue-300">{contactedCount}</span>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Closed:</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">{closedCount}</span>
          </div>
        </div>
      </div>

      {/* Inquiry Items or Empty State */}
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background border border-divider text-muted">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              No Client Inquiries Yet
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              When prospective buyers inquire about your properties, their messages and
              contact details will appear here.
            </p>
          </div>
          <Link
            href="/agent/properties"
            className="inline-block pt-2 text-xs font-semibold text-secondary hover:underline"
          >
            View Active Listings Portfolio →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const property = inquiry.properties;
            const coverUrl = getCoverImageUrl(property?.property_images);
            const isSupabase = coverUrl.startsWith("https://afxgijkdaaidklzhwell.supabase.co");
            const senderName = inquiry.profiles?.full_name || "Prospective Client";
            const dateStr = new Date(inquiry.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={inquiry.id}
                className="rounded-2xl border border-divider bg-surface p-5 sm:p-6 space-y-4 transition-all hover:border-primary/30 shadow-xs"
              >
                {/* Associated Property Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-divider bg-background">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={property?.title || "Property image"}
                          fill
                          unoptimized={!isSupabase}
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      {property ? (
                        <Link
                          href={`/properties/${property.slug}`}
                          className="font-display text-sm sm:text-base font-semibold text-foreground hover:text-secondary truncate block transition-colors"
                        >
                          {property.title}
                        </Link>
                      ) : (
                        <span className="font-display text-sm font-semibold text-muted">
                          Unpublished or Removed Listing
                        </span>
                      )}
                      <p className="text-xs text-muted">
                        {property ? (
                          <>
                            <span>
                              {property.city}, {property.country}
                            </span>
                            <span className="mx-1.5">•</span>
                            <span className="font-medium text-foreground">
                              {formatPropertyPrice(property.price)}
                            </span>
                          </>
                        ) : (
                          "Reference unavailable"
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-muted shrink-0 self-start sm:self-auto">
                    Received {dateStr}
                  </span>
                </div>

                {/* Sender & Message Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-secondary font-semibold text-[11px]">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-foreground">{senderName}</span>
                    <span className="text-muted text-[11px]">inquired:</span>
                  </div>

                  <div className="rounded-xl border border-divider/80 bg-background/60 p-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {inquiry.message}
                  </div>
                </div>

                {/* Interactive Status Controls (RPC backed) */}
                <InquiryStatusControl
                  inquiryId={inquiry.id}
                  initialStatus={inquiry.status}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
