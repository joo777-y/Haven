"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Search,
  Building2,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import InquiryStatusControl from "@/components/inquiries/InquiryStatusControl";
import AgentInquiryNote from "@/components/inquiries/AgentInquiryNote";
import type { InquiryWithDetails, InquiryStatus } from "@/types/property";
import { formatPropertyPrice, getCoverImageUrl } from "@/types/property";

interface AgentInquiryManagerProps {
  initialInquiries: InquiryWithDetails[];
}

export default function AgentInquiryManager({
  initialInquiries,
}: AgentInquiryManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "new" | "contacted" | "closed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const newCount = useMemo(
    () => initialInquiries.filter((i) => i.status === "new").length,
    [initialInquiries]
  );
  const contactedCount = useMemo(
    () => initialInquiries.filter((i) => i.status === "contacted").length,
    [initialInquiries]
  );
  const closedCount = useMemo(
    () => initialInquiries.filter((i) => i.status === "closed").length,
    [initialInquiries]
  );

  const filteredInquiries = useMemo(() => {
    return initialInquiries.filter((inq) => {
      // Status filter
      if (selectedStatus !== "all" && inq.status !== selectedStatus) {
        return false;
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const buyerName = inq.profiles?.full_name?.toLowerCase() || "";
        const propertyTitle = inq.properties?.title?.toLowerCase() || "";
        const message = inq.message.toLowerCase();

        if (
          !buyerName.includes(q) &&
          !propertyTitle.includes(q) &&
          !message.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [initialInquiries, selectedStatus, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedStatus !== "all";

  return (
    <div className="space-y-6">
      {/* 1. Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-divider pb-4 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface text-muted hover:text-foreground hover:bg-surface/80 border border-divider"
          }`}
        >
          <span>All Inquiries</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "all"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {initialInquiries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("new")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "new"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-500/5 border border-divider"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>New Leads</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "new"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {newCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("contacted")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "contacted"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-500/5 border border-divider"
          }`}
        >
          <Clock className="h-3 w-3" />
          <span>Contacted</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "contacted"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {contactedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("closed")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedStatus === "closed"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-surface text-muted hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/5 border border-divider"
          }`}
        >
          <CheckCircle2 className="h-3 w-3" />
          <span>Closed</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              selectedStatus === "closed"
                ? "bg-white/20 text-white"
                : "bg-divider text-muted"
            }`}
          >
            {closedCount}
          </span>
        </button>
      </div>

      {/* 2. Keyword Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <Input
            placeholder="Search leads by client name, property, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("all");
            }}
            className="h-10 px-2.5 text-xs text-muted hover:text-foreground gap-1"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>

      {/* 3. Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="rounded-2xl border border-divider bg-surface p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background border border-divider text-muted">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {hasActiveFilters
                ? "No inquiries match your current filter"
                : "No Client Inquiries Yet"}
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {hasActiveFilters
                ? "Try clearing your search terms or selecting another status tab."
                : "When prospective buyers inquire about your properties, their messages and contact details will appear here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const property = inquiry.properties;
            const coverUrl = getCoverImageUrl(property?.property_images);
            const isSupabase = coverUrl.startsWith(
              "https://afxgijkdaaidklzhwell.supabase.co"
            );
            const senderName =
              inquiry.profiles?.full_name || "Prospective Client";
            const dateStr = new Date(inquiry.created_at).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

                const buyerPhone = inquiry.profiles?.phone || inquiry.buyer_phone || null;
                const emailInMsg = inquiry.message?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || null;
                const buyerEmail = inquiry.profiles?.email || inquiry.buyer_email || emailInMsg || null;

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
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-secondary font-semibold text-[11px]">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-semibold text-foreground">
                            {senderName}
                          </span>
                        </div>

                        {/* Direct Contact Triggers */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {buyerPhone && (
                            <a
                              href={`tel:${buyerPhone.replace(/\s+/g, "")}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title={`Call ${buyerPhone}`}
                            >
                              <Phone className="h-3 w-3" />
                              <span>Call ({buyerPhone})</span>
                            </a>
                          )}

                          {buyerEmail && (
                            <a
                              href={`mailto:${buyerEmail}?subject=${encodeURIComponent(
                                `HAVEN: Regarding inquiry on ${property?.title || "Property"}`
                              )}&body=${encodeURIComponent(
                                `Hello ${senderName},\n\nThank you for inquiring about ${property?.title || "this residence"}.\n\n`
                              )}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-secondary/30 bg-secondary/5 text-[11px] font-medium text-secondary hover:bg-secondary/10 transition-colors"
                              title={`Send email to ${buyerEmail}`}
                            >
                              <Mail className="h-3 w-3" />
                              <span>Email ({buyerEmail})</span>
                            </a>
                          )}

                          {!buyerPhone && !buyerEmail && (
                            <span className="text-[11px] text-muted italic">
                              No direct contact provided
                            </span>
                          )}
                        </div>
                      </div>

                  <div className="rounded-xl border border-divider/80 bg-background/60 p-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {inquiry.message}
                  </div>

                  {/* Private Advisor Note (Isolated, Agent-only) */}
                  <AgentInquiryNote
                    inquiryId={inquiry.id}
                    initialNote={inquiry.advisor_note}
                  />
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
