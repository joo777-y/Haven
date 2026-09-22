import { Metadata } from "next";
import Link from "next/link";
import { Building, PlusCircle, MessageSquare, ShieldCheck, UserCheck } from "lucide-react";
import { getUserRoleState } from "@/lib/auth/getRole";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Advisor Portal | HAVEN Real Estate",
  description: "Manage your luxury property listings, client inquiries, and advisor profile.",
};

export default async function AgentOverviewPage() {
  const { user, profile, agent } = await getUserRoleState();

  return (
    <div className="space-y-8">
      {/* Advisor Header Card */}
      <div className="rounded-2xl border border-divider bg-surface p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified HAVEN Advisor
              </span>
              <span className="text-xs text-muted">
                License: {agent?.license_number}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {profile?.full_name || "Advisor"} — {agent?.company_name}
            </h1>
            <p className="text-sm text-muted">
              {agent?.professional_title} • Inquiries to:{" "}
              <span className="text-foreground font-medium">{agent?.email || user?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/agent/properties/new">
              <Button variant="secondary" size="md" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/agent/properties"
          className="group rounded-xl border border-divider bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <Building className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Listing Portfolio
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Manage your active, draft, and archived real estate listings and high-res media.
          </p>
        </Link>

        <Link
          href="/agent/inquiries"
          className="group rounded-xl border border-divider bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Client Inquiries
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Respond to prospective buyer inquiries and update inquiry resolution statuses.
          </p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="group rounded-xl border border-divider bg-surface p-6 transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <UserCheck className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Advisor Profile
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Update your public advisor bio, portrait photo, and brokerage contact credentials.
          </p>
        </Link>
      </div>
    </div>
  );
}
