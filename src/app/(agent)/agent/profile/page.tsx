import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserCheck } from "lucide-react";
import { getUserRoleState } from "@/lib/auth/getRole";
import AgentProfileForm from "@/components/agent/AgentProfileForm";

export const metadata: Metadata = {
  title: "Advisor Profile & Credentials | HAVEN Advisor",
  description:
    "Manage your professional luxury real estate advisory credentials, brokerage information, and client contact details.",
};

export default async function AgentProfilePage() {
  const { user, profile, agent } = await getUserRoleState();

  if (!user) {
    redirect("/auth/login?redirect=/agent/profile");
  }

  if (!agent) {
    redirect("/agent/register");
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Navigation & Header */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/agent"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Advisor Command Center</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-secondary" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Advisor Profile
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              Manage your professional credentials, brokerage representation, and public profile presentation.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <AgentProfileForm
        userId={user.id}
        initialProfile={{
          fullName: profile?.full_name || "",
          avatarUrl: profile?.avatar_url || null,
          email: user.email || "",
          phone: profile?.phone || null,
          bio: profile?.bio || null,
        }}
        initialAgent={{
          id: agent.id,
          companyName: agent.company_name || null,
          professionalTitle: agent.professional_title || null,
          bio: agent.bio || null,
          phone: agent.phone || null,
          licenseNumber: agent.license_number || null,
          email: agent.email || null,
        }}
      />
    </div>
  );
}
