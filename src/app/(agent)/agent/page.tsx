import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Building,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  ExternalLink,
  Edit,
  DollarSign,
  UserCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { getUserRoleState } from "@/lib/auth/getRole";
import { getAgentDashboardStats } from "@/lib/properties/queries";
import { formatPropertyPrice } from "@/types/property";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Advisor Command Center | HAVEN",
  description:
    "Executive portfolio analytics, listing inventory distribution, and client inquiry pipeline.",
};

export default async function AgentOverviewPage() {
  const { user, profile, agent } = await getUserRoleState();
  const stats = await getAgentDashboardStats();

  const displayName = profile?.full_name || "Licensed Advisor";
  const companyName = agent?.company_name || "HAVEN Private Brokerage";
  const professionalTitle = agent?.professional_title || "Real Estate Advisor";

  const totalListings = stats?.totalListings ?? 0;
  const publishedCount = stats?.publishedCount ?? 0;
  const draftCount = stats?.draftCount ?? 0;
  const archivedCount = stats?.archivedCount ?? 0;
  const totalInquiries = stats?.totalInquiries ?? 0;
  const newInquiriesCount = stats?.newInquiriesCount ?? 0;
  const totalPortfolioValue = stats?.totalPortfolioValue ?? 0;
  const recentInquiries = stats?.recentInquiries ?? [];
  const recentProperties = stats?.recentProperties ?? [];

  return (
    <div className="space-y-10">
      {/* 1. Executive Advisor Identity & Overview Header */}
      <div className="relative overflow-hidden rounded-3xl border border-divider bg-gradient-to-br from-surface via-surface/90 to-background p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary border border-secondary/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                HAVEN Advisor
              </span>
              {agent?.license_number && (
                <span className="text-xs text-muted font-medium">
                  License ID: {agent.license_number}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {displayName} — {companyName}
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              {professionalTitle} • Receiving inquiries at:{" "}
              <span className="text-foreground font-medium">
                {agent?.email || user?.email}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/agent/properties/new">
              <Button variant="secondary" size="md" className="gap-2 text-xs shadow-xs">
                <PlusCircle className="h-4 w-4" />
                <span>Add New Listing</span>
              </Button>
            </Link>

            <Link href="/agent/properties">
              <Button variant="outline" size="md" className="gap-2 text-xs">
                <Building className="h-4 w-4 text-muted" />
                <span>Inventory Manager</span>
              </Button>
            </Link>

            <Link href="/agent/profile">
              <Button variant="outline" size="md" className="gap-2 text-xs">
                <UserCheck className="h-4 w-4 text-muted" />
                <span>Advisor Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Executive 4-Card KPI Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Published Listings */}
        <Link
          href="/agent/properties?status=published"
          className="group rounded-2xl border border-divider bg-surface p-5 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
              <Building className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {publishedCount}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
            Active Listings
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Live on the public marketplace and receiving buyer inquiries.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform">
            <span>View Active ({publishedCount})</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        {/* Drafts & In-Progress */}
        <Link
          href="/agent/properties?status=draft"
          className="group rounded-2xl border border-divider bg-surface p-5 transition-all duration-300 hover:border-amber-500/40 hover:shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-2xs">
              <Clock className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {draftCount}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
            Draft Listings
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Unpublished properties awaiting imagery, pricing, or review.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform">
            <span>Manage Drafts ({draftCount})</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        {/* Client Inquiries */}
        <Link
          href="/agent/inquiries?status=new"
          className="group rounded-2xl border border-divider bg-surface p-5 transition-all duration-300 hover:border-secondary/40 hover:shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors shadow-2xs relative">
              <MessageSquare className="h-5 w-5" />
              {newInquiriesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
                </span>
              )}
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              {newInquiriesCount}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors">
            New Client Leads
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            {newInquiriesCount > 0
              ? `${newInquiriesCount} awaiting your direct advisor response.`
              : "All buyer inquiries are currently resolved."}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-0.5 transition-transform">
            <span>Open Leads Inbox ({totalInquiries})</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        {/* Portfolio Valuation */}
        <div className="rounded-2xl border border-divider bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="font-display text-xs uppercase tracking-wider text-muted font-semibold">
              Live Assets
            </span>
          </div>
          <div className="space-y-1">
            <span className="font-display text-xl sm:text-2xl font-bold text-primary tracking-tight">
              {formatPropertyPrice(totalPortfolioValue)}
            </span>
            <h3 className="font-display text-base font-semibold text-foreground">
              Portfolio Valuation
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Combined asking valuation across your active published portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dual Pipeline Workspace: Recent Inquiries + Recent Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Client Inquiries Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <div className="space-y-0.5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Inquiry & Lead Pipeline
              </h2>
              <p className="text-xs text-muted">
                Recent private viewing and information requests from prospective buyers.
              </p>
            </div>
            {recentInquiries.length > 0 && (
              <Link
                href="/agent/inquiries"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                View all ({totalInquiries})
              </Link>
            )}
          </div>

          {recentInquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-divider bg-surface/50 p-8 text-center space-y-3">
              <MessageSquare className="h-8 w-8 text-muted/50 mx-auto" />
              <div className="space-y-1">
                <p className="font-display text-sm font-semibold text-foreground">
                  No Client Inquiries Yet
                </p>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  When verified clients submit tour requests or questions on your listings, they will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInquiries.map((inq) => {
                const dateStr = new Date(inq.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-divider bg-surface p-4 transition-all hover:border-primary/30 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-display text-sm font-semibold text-foreground truncate block">
                          {inq.buyerName}
                        </span>
                        <span className="text-[11px] text-muted truncate block">
                          re: <span className="font-medium text-foreground">{inq.propertyTitle}</span>
                        </span>
                      </div>

                      {inq.status === "new" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          New Lead
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
                      <span>Received {dateStr}</span>
                      <Link
                        href="/agent/inquiries"
                        className="text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Manage Lead</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recent Listing Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-divider">
            <div className="space-y-0.5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Listings
              </h2>
              <p className="text-xs text-muted">
                Quick access to modify, review, or edit your recently created residences.
              </p>
            </div>
            {recentProperties.length > 0 && (
              <Link
                href="/agent/properties"
                className="text-xs font-semibold text-secondary hover:underline"
              >
                View all ({totalListings})
              </Link>
            )}
          </div>

          {recentProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-divider bg-surface/50 p-8 text-center space-y-3">
              <Building2 className="h-8 w-8 text-muted/50 mx-auto" />
              <div className="space-y-1">
                <p className="font-display text-sm font-semibold text-foreground">
                  No Listings Created
                </p>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Publish luxury villas, coastal penthouses, or contemporary architectural residences.
                </p>
              </div>
              <Link href="/agent/properties/new">
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Create Your First Listing</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProperties.map((prop) => (
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
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/agent/properties/${prop.id}/edit`}
                        className="font-display text-sm font-semibold text-foreground group-hover:text-secondary truncate block transition-colors"
                      >
                        {prop.title}
                      </Link>
                      <Badge
                        variant={
                          prop.status === "published"
                            ? "secondary"
                            : prop.status === "draft"
                            ? "surface"
                            : "outline"
                        }
                        size="sm"
                        className="capitalize shrink-0 text-[10px]"
                      >
                        {prop.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted truncate mt-0.5">
                      {prop.city} • {formatPropertyPrice(prop.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/agent/properties/${prop.id}/edit`}
                      className="p-2 text-muted hover:text-secondary transition-colors"
                      title="Edit property"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {prop.status === "published" && (
                      <Link
                        href={`/properties/${prop.slug}`}
                        target="_blank"
                        className="p-2 text-muted hover:text-primary transition-colors"
                        title="View live catalog listing"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Quick Actions Strip */}
      <div className="rounded-2xl border border-divider bg-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold text-foreground">
            Advisor Management Operations
          </h3>
          <p className="text-xs text-muted">
            Direct shortcuts to manage your listings, respond to client leads, and update brokerage branding.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/agent/properties/new">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Property</span>
            </Button>
          </Link>
          <Link href="/agent/inquiries">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5 text-secondary" />
              <span>Leads Inbox</span>
            </Button>
          </Link>
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm" className="text-xs">
              Brokerage Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
