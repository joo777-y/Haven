"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User as UserIcon,
  Heart,
  FolderHeart,
  LayoutDashboard,
  Building,
  PlusCircle,
  MessageSquare,
  Settings,
  LogOut,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import AuthModal from "./AuthModal";
import { useRouter } from "next/navigation";
export default function UserMenu() {
  const router = useRouter();
  const { user, profile, agent, isAgent, isLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  //const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-9 w-24 rounded-lg bg-divider/40 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/auth/login")}
          >
            Sign In
          </Button>
            <Button
              variant="primary" 
              size="sm"
              onClick={() => router.push("/auth/register")}
              >
              Get Started
            </Button>
        </div>
      </>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-divider bg-surface/80 p-1 pl-2 pr-3 text-xs font-medium text-foreground transition-all hover:border-primary/40 focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white overflow-hidden">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              fill
              sizes="28px"
              className="object-cover"
            />
          ) : (
            userInitials
          )}
        </div>
        <span className="max-w-[100px] truncate font-medium">{displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-divider bg-background p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50">
          {/* User Info Header */}
          <div className="border-b border-divider/60 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-foreground truncate">
                {displayName}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isAgent
                    ? "bg-secondary/10 text-secondary"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {isAgent ? "Advisor" : "Member"}
              </span>
            </div>
            <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
          </div>

          {/* Navigation Links */}
          <div className="py-1 space-y-0.5 text-xs">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-muted" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/saved"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
            >
              <Heart className="h-4 w-4 text-muted" />
              <span>Saved Properties</span>
            </Link>

            <Link
              href="/dashboard/inquiries"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-muted" />
              <span>My Inquiries</span>
            </Link>

            <Link
              href="/dashboard/collections"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
            >
              <FolderHeart className="h-4 w-4 text-muted" />
              <span>Collections</span>
            </Link>

            {/* Agent Portal Section */}
            {isAgent ? (
              <>
                <div className="my-1 border-t border-divider/60" />
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Advisor Portal
                </div>
                <Link
                  href="/agent"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors font-medium"
                >
                  <Briefcase className="h-4 w-4 text-secondary" />
                  <span>Advisor Overview</span>
                </Link>
                <Link
                  href="/agent/properties"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
                >
                  <Building className="h-4 w-4 text-muted" />
                  <span>My Listings</span>
                </Link>
                <Link
                  href="/agent/properties/new"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
                >
                  <PlusCircle className="h-4 w-4 text-muted" />
                  <span>Add New Listing</span>
                </Link>
                <Link
                  href="/agent/inquiries"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
                >
                  <MessageSquare className="h-4 w-4 text-muted" />
                  <span>Client Inquiries</span>
                </Link>
              </>
            ) : (
              <>
                <div className="my-1 border-t border-divider/60" />
                <Link
                  href="/agent/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-secondary hover:bg-secondary/10 transition-colors font-medium"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Become an Advisor</span>
                </Link>
              </>
            )}

            <div className="my-1 border-t border-divider/60" />

            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
            >
              <UserIcon className="h-4 w-4 text-muted" />
              <span>Profile & Account</span>
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface transition-colors"
            >
              <Settings className="h-4 w-4 text-muted" />
              <span>Preferences</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
