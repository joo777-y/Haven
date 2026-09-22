"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signInAction } from "@/lib/auth/actions";
import { useAuth } from "@/components/auth/AuthProvider";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
  isModal?: boolean;
}

export default function LoginForm({
  onSuccess,
  redirectUrl,
  isModal = false,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const targetRedirect =
    redirectUrl || searchParams?.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("redirect", targetRedirect);

      const res = await signInAction(formData);

      if (!res.success) {
        setError(res.message || "Invalid credentials");
        if (res.errors) setFieldErrors(res.errors);
        setIsLoading(false);
        return;
      }

      await refreshProfile();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(res.data?.redirectTo || targetRedirect);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

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

      <div className="space-y-1">
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          error={fieldErrors.password?.[0]}
          autoComplete="current-password"
          required
        />
        {!isModal && (
          <div className="flex justify-end pt-1">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-muted hover:text-secondary transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      {!isModal && (
        <p className="text-center text-xs text-muted pt-2">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary hover:text-secondary transition-colors"
          >
            Create account
          </Link>
        </p>
      )}
    </form>
  );
}
