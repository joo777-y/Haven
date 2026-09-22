"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { forgotPasswordAction } from "@/lib/auth/actions";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const res = await forgotPasswordAction(formData);

      if (!res.success) {
        setError(res.message || "Failed to send reset email.");
        if (res.errors) setFieldErrors(res.errors);
      } else {
        setSuccess(
          res.message || "Password reset instructions sent to your email."
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display text-lg font-semibold text-foreground">
            Check Your Email
          </h4>
          <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
            {success}
          </p>
        </div>
        <div className="pt-2">
          <Link href="/auth/login">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <p className="text-xs text-muted leading-relaxed">
        Enter your registered email address and we&apos;ll send you a link to reset your password.
      </p>

      <Input
        label="Email Address"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="h-4 w-4" />}
        error={fieldErrors.email?.[0]}
        autoComplete="email"
        required
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending link...</span>
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>

      <div className="pt-2 text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
