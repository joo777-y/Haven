import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | HAVEN Real Estate",
  description: "Join the HAVEN network to discover, save, and curate luxury real estate listings.",
};

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-divider bg-surface p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Join the HAVEN Network
        </h1>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          Create your personal profile to discover exceptional architecture and connect with premier advisors.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
