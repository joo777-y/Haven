"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
  ArrowUpDown,
  Building2,
  ExternalLink,
  Edit,
  BarChart3,
  Clock,
  Zap,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatPropertyPrice } from "@/types/property";
import type {
  AgentPropertyAnalytics,
  AgentResponseVelocity,
} from "@/types/agent";

type SortOption =
  | "views"
  | "favorites"
  | "inquiries"
  | "conversion"
  | "newest"
  | "price_sqm_asc"
  | "price_sqm_desc";

interface AgentAnalyticsSectionProps {
  analytics: AgentPropertyAnalytics[];
  velocity?: AgentResponseVelocity | null;
}

/**
 * Human-readable response time formatter:
 * Examples: `< 1 hour`, `2h 15m`, `1 day 4h`, or `—` for empty/unresponded.
 */
function formatResponseTime(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || isNaN(hours) || hours < 0) {
    return "—";
  }

  if (hours < 1) {
    return "< 1 hour";
  }

  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  const dayLabel = days === 1 ? "day" : "days";
  return remainingHours > 0
    ? `${days} ${dayLabel} ${remainingHours}h`
    : `${days} ${dayLabel}`;
}

export default function AgentAnalyticsSection({
  analytics,
  velocity,
}: AgentAnalyticsSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>("views");

  // Aggregate metrics across all agent properties
  const summary = useMemo(() => {
    const totalViews = analytics.reduce((acc, p) => acc + p.views_count, 0);
    const totalUniqueViewers = analytics.reduce(
      (acc, p) => acc + p.unique_viewers_count,
      0
    );
    const totalFavorites = analytics.reduce(
      (acc, p) => acc + p.favorites_count,
      0
    );
    const totalInquiries = analytics.reduce(
      (acc, p) => acc + p.inquiries_count,
      0
    );

    // Guard against division by zero
    const overallConversionRate =
      totalViews > 0
        ? Number(((totalInquiries / totalViews) * 100).toFixed(2))
        : 0;

    return {
      totalViews,
      totalUniqueViewers,
      totalFavorites,
      totalInquiries,
      overallConversionRate,
    };
  }, [analytics]);

  // Client-side sorted property dataset
  const sortedProperties = useMemo(() => {
    const items = [...analytics];
    switch (sortBy) {
      case "views":
        return items.sort((a, b) => b.views_count - a.views_count);
      case "favorites":
        return items.sort((a, b) => b.favorites_count - a.favorites_count);
      case "inquiries":
        return items.sort((a, b) => b.inquiries_count - a.inquiries_count);
      case "conversion":
        return items.sort(
          (a, b) => b.inquiry_conversion_rate - a.inquiry_conversion_rate
        );
      case "newest":
        return items.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "price_sqm_asc":
        return items.sort((a, b) => {
          if (a.price_per_sqm === null && b.price_per_sqm === null) return 0;
          if (a.price_per_sqm === null) return 1;
          if (b.price_per_sqm === null) return -1;
          return a.price_per_sqm - b.price_per_sqm;
        });
      case "price_sqm_desc":
        return items.sort((a, b) => {
          if (a.price_per_sqm === null && b.price_per_sqm === null) return 0;
          if (a.price_per_sqm === null) return 1;
          if (b.price_per_sqm === null) return -1;
          return b.price_per_sqm - a.price_per_sqm;
        });
      default:
        return items;
    }
  }, [analytics, sortBy]);

  return (
    <section className="space-y-8">
      {/* 1. Marketplace Performance Header & Metrics */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-divider">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">
                Marketplace Performance & Analytics
              </h2>
            </div>
            <p className="text-xs text-muted">
              Track live viewer traffic, buyer favorites, and lead conversion velocity across your portfolio.
            </p>
          </div>
        </div>

        {/* Aggregate Overview Metric Cards (5 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Views */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Total Views</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Eye className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {summary.totalViews.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted block">
              Total property views
            </span>
          </div>

          {/* Unique Viewers */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Unique Viewers</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Users className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {summary.totalUniqueViewers.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted block">
              Unique visitor sessions
            </span>
          </div>

          {/* Favorites */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Saved Listings</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Heart className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {summary.totalFavorites.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted block">
              Client bookmarks
            </span>
          </div>

          {/* Inquiries */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Total Inquiries</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <MessageSquare className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {summary.totalInquiries.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted block">
              Buyer lead inquiries
            </span>
          </div>

          {/* Average Inquiry Conversion */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-2 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Conversion Rate</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {summary.overallConversionRate}%
            </span>
            <span className="text-[11px] text-muted block">
              Inquiries per view
            </span>
          </div>
        </div>
      </div>

      {/* 2. Response Velocity Metric Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-divider">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Zap className="h-3 w-3" />
              </span>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
                Response Velocity
              </h3>
            </div>
            <p className="text-xs text-muted">
              Advisor communication turnaround from lead submission to initial outreach.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Average Response Time */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Avg Response</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Clock className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {formatResponseTime(velocity?.avg_response_hours)}
            </span>
            <span className="text-[11px] text-muted block">
              Average time to contact
            </span>
          </div>

          {/* Fastest Response */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Fastest Response</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {formatResponseTime(velocity?.fastest_response_hours)}
            </span>
            <span className="text-[11px] text-muted block">
              Best response turnaround
            </span>
          </div>

          {/* Pending Inquiries */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Pending Inquiries</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Hourglass className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-foreground block">
                {(velocity?.pending_inquiries ?? 0).toLocaleString()}
              </span>
              {(velocity?.pending_inquiries ?? 0) > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  Action needed
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted block">
              Awaiting advisor outreach
            </span>
          </div>

          {/* Responded Inquiries */}
          <div className="rounded-2xl border border-divider bg-surface p-4 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-medium">Responded Inquiries</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground block">
              {(velocity?.responded_inquiries ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted block">
              Contacted of {(velocity?.total_inquiries ?? 0).toLocaleString()} total
            </span>
          </div>
        </div>
      </div>

      {/* 3. Property Performance Table Container */}
      <div className="rounded-2xl border border-divider bg-surface overflow-hidden shadow-xs">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-divider flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-display text-base font-semibold text-foreground">
              Property Performance Breakdown
            </h3>
            <p className="text-xs text-muted">
              Individual engagement statistics and pricing metrics across your active and archived portfolio.
            </p>
          </div>

          {/* Sort Controls */}
          {analytics.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-muted font-medium flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort properties by"
                className="h-8 rounded-lg border border-divider bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-secondary/40 cursor-pointer"
              >
                <option value="views">Most Views</option>
                <option value="favorites">Most Favorites</option>
                <option value="inquiries">Most Inquiries</option>
                <option value="conversion">Highest Conversion</option>
                <option value="price_sqm_asc">Lowest Price / m²</option>
                <option value="price_sqm_desc">Highest Price / m²</option>
                <option value="newest">Newest Residence</option>
              </select>
            </div>
          )}
        </div>

        {/* Empty State */}
        {analytics.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-divider text-muted mx-auto shadow-xs">
              <BarChart3 className="h-6 w-6 text-muted" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-base font-semibold text-foreground">
                No property activity yet
              </h4>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Once visitors start viewing and saving your published residences, their live engagement and inquiry conversion metrics will appear here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/agent/properties/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors shadow-xs"
              >
                <span>Publish a Residence</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider bg-surface/50 text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4 sm:px-6">Property</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                  <th scope="col" className="py-3 px-4 text-right">Views</th>
                  <th scope="col" className="py-3 px-4 text-right">Unique</th>
                  <th scope="col" className="py-3 px-4 text-right">Favorites</th>
                  <th scope="col" className="py-3 px-4 text-right">Inquiries</th>
                  <th scope="col" className="py-3 px-4 text-right">Conversion</th>
                  <th scope="col" className="py-3 px-4 text-right">Price / m²</th>
                  <th scope="col" className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {sortedProperties.map((prop) => (
                  <tr
                    key={prop.property_id}
                    className="hover:bg-background/40 transition-colors"
                  >
                    {/* Property Thumbnail & Info */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-divider bg-background">
                          {prop.property_cover_image ? (
                            <Image
                              src={prop.property_cover_image}
                              alt={prop.property_title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted">
                              <Building2 className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                          <Link
                            href={
                              prop.property_status === "published"
                                ? `/properties/${prop.property_slug}`
                                : `/agent/properties/${prop.property_id}/edit`
                            }
                            className="font-display font-semibold text-foreground hover:text-secondary truncate block transition-colors text-sm"
                            title={prop.property_title}
                          >
                            {prop.property_title}
                          </Link>
                          <span className="text-[11px] text-muted truncate block">
                            {prop.property_city} • {formatPropertyPrice(prop.property_price)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          prop.property_status === "published"
                            ? "secondary"
                            : prop.property_status === "draft"
                            ? "surface"
                            : "outline"
                        }
                        size="sm"
                        className="capitalize text-[10px]"
                      >
                        {prop.property_status}
                      </Badge>
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 text-right font-display font-bold text-foreground">
                      {prop.views_count.toLocaleString()}
                    </td>

                    {/* Unique Viewers */}
                    <td className="py-3.5 px-4 text-right text-muted font-medium">
                      {prop.unique_viewers_count.toLocaleString()}
                    </td>

                    {/* Favorites */}
                    <td className="py-3.5 px-4 text-right text-muted font-medium">
                      {prop.favorites_count.toLocaleString()}
                    </td>

                    {/* Inquiries */}
                    <td className="py-3.5 px-4 text-right text-muted font-medium">
                      {prop.inquiries_count.toLocaleString()}
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          prop.inquiry_conversion_rate > 0
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-surface text-muted"
                        }`}
                      >
                        {prop.inquiry_conversion_rate}%
                      </span>
                    </td>

                    {/* Price / m² */}
                    <td className="py-3.5 px-4 text-right font-display font-medium text-foreground whitespace-nowrap">
                      {prop.price_per_sqm !== null && prop.price_per_sqm > 0
                        ? `${formatPropertyPrice(prop.price_per_sqm)}/m²`
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/agent/properties/${prop.property_id}/edit`}
                          className="p-1.5 text-muted hover:text-secondary transition-colors rounded-lg hover:bg-background"
                          title="Edit listing"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {prop.property_status === "published" && (
                          <Link
                            href={`/properties/${prop.property_slug}`}
                            target="_blank"
                            className="p-1.5 text-muted hover:text-primary transition-colors rounded-lg hover:bg-background"
                            title="View live catalog page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
