"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function SavedPropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Saved properties page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-divider bg-surface p-8 text-center shadow-card space-y-4 my-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-2">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground">
        Unable to Load Saved Properties
      </h2>

      <p className="text-xs sm:text-sm text-muted leading-relaxed">
        We encountered a problem loading your saved properties. Please try
        refreshing or return to your dashboard.
      </p>

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

        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
