"use client";

import React, { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  title?: string;
  description?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  title,
  description,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  const modalTitle =
    title || (tab === "login" ? "Sign In to HAVEN" : "Join the HAVEN Network");
  const modalDescription =
    description ||
    (tab === "login"
      ? "Access your saved properties, private collections, and advisor inquiries."
      : "Create your personal profile to discover, curate, and inquire on exclusive properties.");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      size="md"
    >
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-divider bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              tab === "login"
                ? "bg-background text-primary shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              tab === "register"
                ? "bg-background text-primary shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Forms */}
        {tab === "login" ? (
          <Suspense
            fallback={
              <div className="flex h-40 items-center justify-center text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            }
          >
            <LoginForm isModal onSuccess={onClose} />
          </Suspense>
        ) : (
          <RegisterForm isModal onSuccess={onClose} />
        )}
      </div>
    </Modal>
  );
}
