import Link from "next/link";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import { Building2, ArrowLeft, Home } from "lucide-react";

export default function PropertyNotFound() {
  return (
    <div className="py-24">
      <Container>
        <div className="mx-auto max-w-md rounded-2xl border border-divider bg-surface p-8 text-center shadow-card space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-divider text-muted shadow-xs">
            <Building2 className="h-8 w-8 text-muted/60" />
          </div>

          <div className="space-y-2">
            <span className="font-display text-xs uppercase tracking-widest text-secondary font-semibold">
              404 — Not Found
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Residence Not Found
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              The residence you are looking for does not exist, has been archived,
              or is no longer available in the public catalog.
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
