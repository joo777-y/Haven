import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  FolderHeart,
  MessageSquare,
  Settings,
  Briefcase,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Compass,
  Plus,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { getUserRoleState } from "@/lib/auth/getRole";
import { getDashboardOverviewData } from "@/lib/collections/queries";
import { formatPropertyPrice } from "@/types/property";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Dashboard Overview | HAVEN Workspace",
  description:
    "Executive personal workspace for your saved residences, curated collections, and advisor inquiries.",
};

export default async function DashboardPage() {
  const { user, profile, agent, isAgent } = await getUserRoleState();

  const overviewData = user ? await getDashboardOverviewData(user.id) : null;

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Member";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const savedCount = overviewData?.savedCount ?? 0;
  const collectionsCount = overviewData?.collectionsCount ?? 0;
  const inquiriesCount = overviewData?.inquiriesCount ?? 0;
  const recentInquiries = overviewData?.recentInquiries ?? [];
  const recentSaved = overviewData?.recentSavedProperties ?? [];

  return (
    <div className="space-y-10">
      {/* 1. Welcome & Executive Identity Header */}
      <div className="relative overflow-hidden rounded-3xl border border-divider bg-gradient-to-br from-surface via-surface/90 to-background p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-md overflow-hidden border border-white/10">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={displayName}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-semibold uppercase tracking-widest text-secondary">
                  Personal Sanctuary
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isAgent
                      ? "bg-secondary/15 text-secondary border border-secondary/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {isAgent ? "Certified Advisor" : "Private Member"}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Welcome back, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-muted">
                Your private dashboard for curating architectural gems and tracking acquisitions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAgent ? (
              <Link href="/agent">
                <Button variant="secondary" size="md" className="gap-2 text-xs shadow-xs">
                  <Briefcase className="h-4 w-4" />
                  <span>Advisor Workspace</span>
                </Button>
              </Link>
            ) : (
              <Link href="/agent/register">
                <Button variant="outline" size="md" className="gap-2 text-xs">
                  <Briefcase className="h-4 w-4 text-secondary" />
                  <span>Become an Advisor</span>
                </Button>
              </Link>
            )}

            <Link href="/properties">
              <Button variant="primary" size="md" className="gap-2 text-xs shadow-xs">
                <Compass className="h-4 w-4" />
                <span>Explore Catalog</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Saved Residences */}
        <Link
          href="/dashboard/saved"
          className="group relative rounded-2xl border border-divider bg-surface p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-2xs">
              <Heart className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {savedCount}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
            Saved Residences
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Bookmarked residences for immediate comparison and market updates.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform">
            <span>View Saved</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        {/* Curated Collections */}
        <Link
          href="/dashboard/collections"
          className="group relative rounded-2xl border border-divider bg-surface p-5 transition-all duration-300 hover:border-secondary/40 hover:shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors shadow-2xs">
              <FolderHeart className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {collectionsCount}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
            Curated Collections
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Thematic portfolios organized for lifestyle, investment, and location.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform">
            <span>Manage Folders</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        {/* Active Inquiries */}
        <Link
          href="/dashboard/inquiries"
          className="group relative rounded-2xl border border-divider bg-surface p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-2xs">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {inquiriesCount}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
            Sent Inquiries
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Direct messages, private tour bookings, and advisor communications.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform">
            <span>Track Messages</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        {/* Preferences & Settings */}
        <Link
          href="/dashboard/settings"
          className="group relative rounded-2xl border border-divider bg-surface p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface border border-divider text-muted group-hover:bg-primary group-hover:text-white transition-colors shadow-2xs">
              <Settings className="h-5 w-5" />
            </div>
            <span className="font-display text-xs uppercase tracking-wider text-muted font-semibold">
              Config
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
            Preferences & Settings
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Currency conversion, measurement units (sqm/sqft), and notifications.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform">
            <span>Configure</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>
      </div>

      {/* 3. Main Workspace Split: Recent Inquiries + Recent Saved */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Inquiries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <div className="space-y-0.5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Inquiries
              </h2>
              <p className="text-xs text-muted">
                Status of your latest questions and private tour inquiries.
              </p>
            </div>
            {recentInquiries.length > 0 && (
              <Link
                href="/dashboard/inquiries"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                View all ({inquiriesCount})
              </Link>
            )}
          </div>

          {recentInquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-divider bg-surface/50 p-8 text-center space-y-3">
              <MessageSquare className="h-8 w-8 text-muted/50 mx-auto" />
              <div className="space-y-1">
                <p className="font-display text-sm font-semibold text-foreground">
                  No Inquiries Active
                </p>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Submit a question or request a private viewing on any published residence.
                </p>
              </div>
              <Link href="/properties">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Browse Residences</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inq) => {
                const dateStr = new Date(inq.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-divider bg-surface p-4 transition-all hover:border-primary/30 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {inq.propertySlug ? (
                        <Link
                          href={`/properties/${inq.propertySlug}`}
                          className="font-display text-sm font-semibold text-foreground hover:text-secondary truncate block transition-colors"
                        >
                          {inq.propertyTitle}
                        </Link>
                      ) : (
                        <span className="font-display text-sm font-semibold text-foreground truncate">
                          {inq.propertyTitle}
                        </span>
                      )}

                      {inq.status === "new" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Awaiting Reply
                        </span>
                      )}
                      {inq.status === "contacted" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 border border-blue-500/20 shrink-0">
                          <Clock className="h-3 w-3 text-blue-600" />
                          Contacted
                        </span>
                      )}
                      {inq.status === "closed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Closed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed bg-background/50 rounded-lg p-2.5 border border-divider/40">
                      &quot;{inq.message}&quot;
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                      <span>Submitted on {dateStr}</span>
                      <Link
                        href="/dashboard/inquiries"
                        className="text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Saved Residences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <div className="space-y-0.5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Saved Residences
              </h2>
              <p className="text-xs text-muted">
                Quick access to properties you have recently favorited.
              </p>
            </div>
            {recentSaved.length > 0 && (
              <Link
                href="/dashboard/saved"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                View all ({savedCount})
              </Link>
            )}
          </div>

          {recentSaved.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-divider bg-surface/50 p-8 text-center space-y-3">
              <Heart className="h-8 w-8 text-muted/50 mx-auto" />
              <div className="space-y-1">
                <p className="font-display text-sm font-semibold text-foreground">
                  No Saved Properties
                </p>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Bookmark listings to curate your personal collection and monitor price updates.
                </p>
              </div>
              <Link href="/properties">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Discover Properties</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSaved.map((prop) => (
                <div
                  key={prop.id}
                  className="group rounded-2xl border border-divider bg-surface p-3 transition-all hover:border-primary/40 flex items-center gap-3.5 shadow-2xs"
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-divider bg-background">
                    {prop.coverImage ? (
                      <Image
                        src={prop.coverImage}
                        alt={prop.title}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <Building2 className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/properties/${prop.slug}`}
                      className="font-display text-sm font-semibold text-foreground group-hover:text-secondary truncate block transition-colors"
                    >
                      {prop.title}
                    </Link>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {prop.city}, {prop.country}
                    </p>
                    <p className="font-display text-sm font-bold text-primary mt-1">
                      {formatPropertyPrice(prop.price)}
                    </p>
                  </div>

                  <Link
                    href={`/properties/${prop.slug}`}
                    className="shrink-0 p-2 text-muted hover:text-primary transition-colors"
                    aria-label={`View ${prop.title}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Curated Portfolio Shortcuts Bar */}
      <div className="rounded-2xl border border-divider bg-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" />
            <h3 className="font-display text-base font-semibold text-foreground">
              Build Thematic Property Boards
            </h3>
          </div>
          <p className="text-xs text-muted">
            Group luxury villas, coastal penthouses, and high-yield investments into private shareable collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/collections">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <FolderHeart className="h-3.5 w-3.5" />
              <span>Explore My Collections</span>
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm" className="text-xs">
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
