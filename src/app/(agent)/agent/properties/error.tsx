"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { AlertTriangle, RotateCcw, ShieldCheck } from "lucide-react";

export default function AgentPropertiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Agent properties error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-divider bg-surface p-8 text-center shadow-card space-y-4 my-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-2">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground">
        Unable to Load Listings
      </h2>

      <p className="text-xs sm:text-sm text-muted leading-relaxed">
        We encountered an error loading your advisor listing portfolio. Please
        verify your connection or try again.
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

        <Link href="/agent" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Advisor Portal</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
