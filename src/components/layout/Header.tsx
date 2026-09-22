"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu } from "lucide-react";
import FavoritesModal from "@/components/modals/FavoritesModal";
import ProfileModal from "@/components/modals/ProfileModal";
import UserMenu from "@/components/auth/UserMenu";
import MobileMenu from "./MobileMenu";
import Container from "./Container";

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
              <span className="text-secondary ml-1.5 text-base">●</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-sans text-sm transition-colors ${
                      active
                        ? "font-semibold text-primary underline underline-offset-8 decoration-2 decoration-primary"
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
            {/* Saved / Favorites Icon */}
            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="flex items-center justify-center rounded-full p-2 text-muted transition-colors hover:bg-black/5 hover:text-primary cursor-pointer"
              aria-label="Saved Properties"
              title="Saved Properties"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* User Menu / Auth Controls */}
            <div className="hidden sm:block">
              <UserMenu />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center justify-center rounded-lg p-2 text-primary hover:bg-surface md:hidden cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </header>

      {/* Drawers / Modals */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={pathname}
        navLinks={navLinks}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
    </>
  );
}
