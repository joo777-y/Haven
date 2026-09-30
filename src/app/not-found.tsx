import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { Compass, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <Container>
        <div className="mx-auto max-w-md rounded-2xl border border-divider bg-surface p-8 text-center shadow-card space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 border border-secondary/20 text-secondary shadow-xs">
            <Compass className="h-8 w-8 text-secondary animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="font-display text-xs uppercase tracking-widest text-secondary font-semibold">
              404 — Page Not Found
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Off the Beaten Path
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              The page or luxury residence you are seeking could not be found.
              It may have been moved, renamed, or is currently private.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/properties" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Explore Catalog</span>
              </Button>
            </Link>

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
