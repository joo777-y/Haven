import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import SettingsForm from "@/components/dashboard/SettingsForm";

export const metadata: Metadata = {
  title: "Account Preferences & Settings | HAVEN",
  description:
    "Configure display currency, measurement units, and advisor notification channels.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Navigation & Header */}
      <div className="space-y-4 pb-6 border-b border-divider">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard Overview</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Account Preferences
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Tailor your HAVEN experience: currency formatting, measurement units, and communication alerts.
            </p>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile & Password</span>
          </Link>
        </div>
      </div>

      {/* Settings Form */}
      <SettingsForm />
    </div>
  );
}
