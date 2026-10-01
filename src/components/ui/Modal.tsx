"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previously focused element to restore when closing
    previousActiveElement.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    // Focus the first focusable element inside the modal
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      focusableSelectors
    );

    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Trap focus inside modal
      if (e.key === "Tab") {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>(
          focusableSelectors
        );
        if (!elements || elements.length === 0) return;

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Content Dialog */}
      <div
        ref={dialogRef}
        className={`relative z-10 w-full rounded-2xl border border-divider bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${sizes[size]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted hover:bg-surface hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/40"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        {(title || description) && (
          <div className="mb-5 pr-8">
            {title && (
              <h3
                id="modal-title"
                className="font-display text-xl font-semibold text-foreground"
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                id="modal-description"
                className="text-xs text-muted mt-1 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
