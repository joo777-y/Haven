"use client";

import Link from "next/link";
import { X, Heart, User, Building2, Phone, Info } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  navLinks: { href: string; label: string }[];
  onOpenFavorites: () => void;
  onOpenProfile: () => void;
}

export default function MobileMenu({
  isOpen,
  onClose,
  pathname,
  navLinks,
  onOpenFavorites,
  onOpenProfile,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity md:hidden">
      {/* Overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-background p-6 shadow-2xl border-l border-divider animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-divider">
          <Link
            href="/"
            onClick={onClose}
            className="font-display text-2xl font-semibold tracking-tight text-primary flex items-center"
          >
            HAVEN
            <span className="text-secondary ml-1.5 text-base">●</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 py-6">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname?.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-base transition-colors ${
                  isActive
                    ? "bg-primary text-white font-semibold"
                    : "text-foreground hover:bg-surface hover:text-primary font-medium"
                }`}
              >
                <span>{link.label}</span>
                {isActive && <div className="h-2 w-2 rounded-full bg-secondary" />}
              </Link>
            );
          })}
        </nav>

        {/* Action Shortcuts */}
        <div className="border-t border-divider pt-6 space-y-3">
          <button
            onClick={() => {
              onClose();
              onOpenFavorites();
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-divider bg-surface px-4 py-3 text-sm font-semibold text-foreground hover:border-secondary/40 transition-colors cursor-pointer"
          >
            <Heart className="h-5 w-5 text-secondary" />
            <span>Saved Properties</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-divider bg-surface px-4 py-3 text-sm font-semibold text-foreground hover:border-secondary/40 transition-colors cursor-pointer"
          >
            <User className="h-5 w-5 text-primary" />
            <span>Account & Profile</span>
          </button>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              href="/auth/login"
              onClick={onClose}
              className="flex items-center justify-center rounded-lg border border-primary py-2.5 px-3 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors text-center"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="flex items-center justify-center rounded-lg bg-primary py-2.5 px-3 text-xs font-semibold text-white hover:opacity-90 transition-opacity text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
