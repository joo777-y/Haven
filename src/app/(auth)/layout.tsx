import React from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary/20 selection:text-secondary">
      {/* Editorial Header */}
      <header className="border-b border-divider/60 py-6">
        <Container className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl font-bold tracking-tight text-primary group-hover:text-secondary transition-colors">
              HAVEN
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-muted hover:text-foreground transition-colors"
          >
            ← Back to Discovery
          </Link>
        </Container>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-divider/40 py-6 text-center text-xs text-muted">
        <Container>
          <p>© {new Date().getFullYear()} HAVEN Real Estate Discovery. Encrypted & Protected.</p>
        </Container>
      </footer>
    </div>
  );
}
