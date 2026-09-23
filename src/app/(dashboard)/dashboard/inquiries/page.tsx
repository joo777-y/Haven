import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageSquare, Building2, Clock, CheckCircle2, Send } from "lucide-react";
import { getUserInquiries } from "@/lib/properties/queries";
import { formatPropertyPrice, getCoverImageUrl } from "@/types/property";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "My Inquiries | HAVEN Workspace",
  description: "Track the status of your property viewing requests and advisor inquiries.",
};

export default async function UserInquiriesPage() {
  const inquiries = await getUserInquiries();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Area */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard Overview</span>
        </Link>

        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold text-foreground">
            My Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Track communication and responses from listing advisors regarding residences you have inquired about.
          </p>
        </div>
      </div>

      {/* Inquiry List or Empty State */}
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background border border-divider text-muted">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              No Inquiries Sent Yet
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              When you submit questions or request tours for residences in our collection,
              your inquiries and advisor updates will appear here.
            </p>
          </div>
          <Link href="/properties" className="inline-block pt-2">
            <Button variant="primary" size="sm" className="gap-2 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              <span>Explore Residences</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const property = inquiry.properties;
            const coverUrl = getCoverImageUrl(property?.property_images);
            const isSupabase = coverUrl.startsWith("https://afxgijkdaaidklzhwell.supabase.co");
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
                {/* Property Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-divider bg-background">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={property?.title || "Property"}
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
                          Residence Reference
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
                          "Listing info"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 self-start sm:self-auto">
                    {inquiry.status === "new" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Awaiting Advisor Response
                      </span>
                    )}
                    {inquiry.status === "contacted" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        Advisor Contacted
                      </span>
                    )}
                    {inquiry.status === "closed" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Inquiry Closed
                      </span>
                    )}
                  </div>
                </div>

                {/* Sent Message */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="font-medium">Your Message:</span>
                    <span className="text-[11px]">Sent {dateStr}</span>
                  </div>
                  <div className="rounded-xl border border-divider/80 bg-background/60 p-3.5 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {inquiry.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
