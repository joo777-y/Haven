"use client";

import Link from "next/link";
import { X, User, LogIn, UserPlus, Search, HelpCircle, Shield, Building } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl border-l border-divider animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Account</h3>
              <p className="text-xs text-muted">Manage your profile & preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-xl border border-divider bg-surface p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
              <User className="h-6 w-6" />
            </div>
            <h4 className="font-display text-base font-semibold text-foreground">Welcome to Haven</h4>
            <p className="text-xs text-muted mt-1 mb-4">
              Sign in to unlock saved searches, personalized recommendations, and instant inquiries.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary py-2.5 px-3 font-sans text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In</span>
              </Link>
              <Link
                href="/auth/register"
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 px-3 font-sans text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            <h5 className="px-2 text-xs font-bold uppercase tracking-wider text-muted mb-2">Quick Access</h5>

            <Link
              href="/properties"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface hover:text-secondary transition-colors"
            >
              <Search className="h-4 w-4 text-muted" />
              <span>Saved Searches & Alerts</span>
            </Link>

            <Link
              href="/agents"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface hover:text-secondary transition-colors"
            >
              <Building className="h-4 w-4 text-muted" />
              <span>Become an Agent / Partner</span>
            </Link>

            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface hover:text-secondary transition-colors"
            >
              <Shield className="h-4 w-4 text-muted" />
              <span>Security & Privacy</span>
            </Link>

            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface hover:text-secondary transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-muted" />
              <span>Help & Support Center</span>
            </Link>
          </div>
        </div>

        <div className="border-t border-divider p-4 bg-surface text-center">
          <p className="text-[11px] text-muted">Haven Real Estate • Platform v1.0</p>
        </div>
      </div>
    </div>
  );
}
