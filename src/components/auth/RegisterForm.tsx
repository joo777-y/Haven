"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signUpAction } from "@/lib/auth/actions";
import { useAuth } from "@/components/auth/AuthProvider";

interface RegisterFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function RegisterForm({
  onSuccess,
  isModal = false,
}: RegisterFormProps) {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await signUpAction(formData);

      if (!res.success) {
        setError(res.message || "Registration failed");
        if (res.errors) setFieldErrors(res.errors);
        setIsLoading(false);
        return;
      }

      if (res.data?.requireEmailVerification) {
        setVerificationRequired(true);
        setIsLoading(false);
        return;
      }

      await refreshProfile();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setIsLoading(false);
    }
  };

  if (verificationRequired) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display text-lg font-semibold text-foreground">
            Verify Your Email
          </h4>
          <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Please
            check your inbox and confirm your email to complete registration.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
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

      <Input
        label="Full Name"
        type="text"
        placeholder="Alexander Wright"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        leftIcon={<User className="h-4 w-4" />}
        error={fieldErrors.fullName?.[0]}
        autoComplete="name"
        required
      />

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

      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters (1 uppercase, 1 number)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock className="h-4 w-4" />}
        error={fieldErrors.password?.[0]}
        autoComplete="new-password"
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Repeat your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        leftIcon={<Lock className="h-4 w-4" />}
        error={fieldErrors.confirmPassword?.[0]}
        autoComplete="new-password"
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
            <span>Creating account...</span>
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      {!isModal && (
        <p className="text-center text-xs text-muted pt-2">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:text-secondary transition-colors"
          >
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}
