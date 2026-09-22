import { Metadata } from "next";
import ProfileForm from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = {
  title: "Profile & Settings | HAVEN Real Estate",
  description: "Update your profile information and account preferences.",
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Account & Profile
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your personal details, portrait image, and contact information.
        </p>
      </div>

      <div className="rounded-2xl border border-divider bg-surface p-8 shadow-sm">
        <ProfileForm />
      </div>
    </div>
  );
}
