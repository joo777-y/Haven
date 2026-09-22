import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | HAVEN Real Estate",
  description: "Sign in to your HAVEN account to access your saved properties and inquiries.",
};

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-divider bg-surface p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="text-xs text-muted mt-1.5 leading-relaxed">
          Sign in to access your saved properties, private collections, and advisor inquiries.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
