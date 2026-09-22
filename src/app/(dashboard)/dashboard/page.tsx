import { Metadata } from "next";
import Link from "next/link";
import { Heart, FolderHeart, User, Briefcase, Plus } from "lucide-react";
import { getUserRoleState } from "@/lib/auth/getRole";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Dashboard | HAVEN Real Estate",
  description: "Manage your saved properties, collections, and account preferences.",
};

export default async function DashboardPage() {
  const { user, profile, agent, isAgent } = await getUserRoleState();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Member";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-divider bg-surface p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Personal Workspace
            </span>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome, {displayName}
            </h1>
            <p className="text-sm text-muted">
              Explore your saved properties, organize private collections, and track inquiries.
            </p>
          </div>

          {!isAgent && (
            <Link href="/agent/register">
              <Button variant="outline" size="sm" className="gap-2">
                <Briefcase className="h-4 w-4 text-secondary" />
                Become an Advisor
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/saved"
          className="group rounded-xl border border-divider bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Saved Properties
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            View your bookmarked luxury residences and track market changes.
          </p>
        </Link>

        <Link
          href="/dashboard/collections"
          className="group rounded-xl border border-divider bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
            <FolderHeart className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Curated Collections
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Organize properties into tailored portfolios and dream home lists.
          </p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="group rounded-xl border border-divider bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <User className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Profile & Settings
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Update your personal details, avatar, contact phone, and security settings.
          </p>
        </Link>
      </div>

      {/* If Agent, Show Portal Summary */}
      {isAgent && (
        <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-secondary" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Advisor Portal Access
              </h3>
            </div>
            <p className="text-xs text-muted mt-1">
              Active as <span className="font-medium text-foreground">{agent?.professional_title}</span> at{" "}
              <span className="font-medium text-foreground">{agent?.company_name}</span>.
            </p>
          </div>
          <Link href="/agent">
            <Button variant="secondary" size="sm">
              Open Advisor Portal →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
