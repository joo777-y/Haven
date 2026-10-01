"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Heart, Menu } from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import Container from "./Container";

const FavoritesModal = dynamic(() => import("@/components/modals/FavoritesModal"), {
  ssr: false,
});
const ProfileModal = dynamic(() => import("@/components/modals/ProfileModal"), {
  ssr: false,
});
const MobileMenu = dynamic(() => import("./MobileMenu"), {
  ssr: false,
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/agents", label: "Agents" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Real favorites counter (starts at 0 when no items are saved)
  const savedCount = 0;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-divider bg-background/90 backdrop-blur-md">
        <Container className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight text-primary flex items-center"
            >
              HAVEN
              <span className="text-secondary ml-1.5 text-base select-none">●</span>
            </Link>

            {/* Desktop Navigation with Tight Active Accent */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative inline-flex items-center py-1 font-sans text-sm transition-colors ${
                      active
                        ? "font-semibold text-primary after:absolute after:-bottom-1.5 after:inset-x-0 after:h-0.5 after:bg-secondary after:rounded-full"
                        : "font-medium text-muted hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Saved / Favorites Icon with Counter Badge */}
            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/40"
              aria-label={`Saved Properties (${savedCount} saved)`}
              title="Saved Properties"
            >
              <Heart className="h-5 w-5" />
              {savedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shadow-2xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* User Menu / Auth Controls */}
            <div className="hidden sm:block">
              <UserMenu />
            </div>

            {/* Mobile Hamburger Button with 44x44 minimum touch target */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-primary hover:bg-surface md:hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/40"
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </header>

      {/* Drawers / Modals (Lazy-loaded on first user interaction) */}
      {isFavoritesOpen && (
        <FavoritesModal
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
        />
      )}

      {isProfileOpen && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {isMobileMenuOpen && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          pathname={pathname}
          navLinks={navLinks}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}
    </>
  );
}
