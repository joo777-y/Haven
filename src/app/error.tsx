"use client";

import { useEffect } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception safely without leaking to client console if in production
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <Container>
        <div className="mx-auto max-w-md rounded-2xl border border-divider bg-surface p-8 text-center shadow-card space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shadow-xs">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          <div className="space-y-2">
            <span className="font-display text-xs uppercase tracking-widest text-secondary font-semibold">
              Something went wrong
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              An Unexpected Error Occurred
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              We experienced a temporary issue while loading this page.
              Our technical team has been notified.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
              onClick={() => reset()}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </Button>

            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Return Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
