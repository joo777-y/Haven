import { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password | HAVEN Real Estate",
  description: "Set a new secure password for your HAVEN account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="rounded-2xl border border-divider bg-surface p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Create New Password
        </h1>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          Choose a strong password to protect your account and collections.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
