"use client";

import Link from "next/link";
import Image from "next/image";
import {
  X,
  Heart,
  User as UserIcon,
  LayoutDashboard,
  FolderHeart,
  Briefcase,
  Building,
  PlusCircle,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

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
}: MobileMenuProps) {
  const { user, profile, agent, isAgent, signOut } = useAuth();

  if (!isOpen) return null;

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Member";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity md:hidden">
      {/* Overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-background p-6 shadow-2xl border-l border-divider animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-divider">
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

        {/* User Card if Authenticated */}
        {user && (
          <div className="mt-4 rounded-xl border border-divider bg-surface p-3.5 flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white overflow-hidden">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-foreground truncate">
                {displayName}
              </p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5 ${
                  isAgent
                    ? "bg-secondary/10 text-secondary"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {isAgent ? "Advisor" : "Member"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 py-4">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            Explore
          </div>
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
                className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white font-semibold"
                    : "text-foreground hover:bg-surface hover:text-primary font-medium"
                }`}
              >
                <span>{link.label}</span>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-secondary" />}
              </Link>
            );
          })}
        </nav>

        {/* Workspace Links */}
        <div className="border-t border-divider pt-4 space-y-1.5">
          {user ? (
            <>
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                Personal Workspace
              </div>

              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-foreground hover:bg-surface"
              >
                <LayoutDashboard className="h-4 w-4 text-muted" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/saved"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-foreground hover:bg-surface"
              >
                <Heart className="h-4 w-4 text-muted" />
                <span>Saved Properties</span>
              </Link>

              <Link
                href="/dashboard/collections"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-foreground hover:bg-surface"
              >
                <FolderHeart className="h-4 w-4 text-muted" />
                <span>Collections</span>
              </Link>

              {isAgent ? (
                <>
                  <div className="mt-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Advisor Portal
                  </div>
                  <Link
                    href="/agent"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium text-foreground hover:bg-surface"
                  >
                    <Briefcase className="h-4 w-4 text-secondary" />
                    <span>Advisor Overview</span>
                  </Link>
                  <Link
                    href="/agent/properties"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-foreground hover:bg-surface"
                  >
                    <Building className="h-4 w-4 text-muted" />
                    <span>My Listings</span>
                  </Link>
                  <Link
                    href="/agent/inquiries"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-foreground hover:bg-surface"
                  >
                    <MessageSquare className="h-4 w-4 text-muted" />
                    <span>Client Inquiries</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/agent/register"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium text-secondary hover:bg-secondary/10"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Become an Advisor</span>
                </Link>
              )}

              <div className="pt-2 border-t border-divider/60">
                <button
                  onClick={() => {
                    onClose();
                    signOut();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
