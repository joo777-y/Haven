"use client";

import { useEffect } from "react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function PropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Properties catalog error:", error);
  }, [error]);

  return (
    <div className="py-20">
      <Container>
        <div className="mx-auto max-w-md rounded-2xl border border-divider bg-surface p-8 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-5">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground">
            Unable to Load Catalog
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
            We encountered a problem fetching the property catalog. Please check
            your connection and try again.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
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
