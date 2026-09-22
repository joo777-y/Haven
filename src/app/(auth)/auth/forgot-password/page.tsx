import { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | HAVEN Real Estate",
  description: "Reset your HAVEN account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-divider bg-surface p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Reset Password
        </h1>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          We&apos;ll help you regain access to your HAVEN account safely.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
