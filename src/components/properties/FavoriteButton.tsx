"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import { toggleFavoriteAction } from "@/lib/properties/actions";

interface FavoriteButtonProps {
  propertyId: string;
  initialIsSaved?: boolean;
  className?: string;
  variant?: "icon" | "button";
  showLabel?: boolean;
  onToggleSuccess?: (isSaved: boolean) => void;
}

export default function FavoriteButton({
  propertyId,
  initialIsSaved = false,
  className = "",
  variant = "icon",
  showLabel = false,
  onToggleSuccess,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. If anonymous, prompt login with existing AuthModal
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // 2. Optimistic update with automatic rollback
    const previousState = isSaved;
    const nextState = !previousState;
    setIsSaved(nextState);

    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(propertyId, pathname);
        if (!result.success) {
          // Rollback on failure
          setIsSaved(previousState);
          console.error("Failed to toggle favorite:", result.error);
        } else {
          const finalState = result.isSaved ?? nextState;
          setIsSaved(finalState);
          onToggleSuccess?.(finalState);
        }
      } catch (err) {
        // Rollback on unexpected exception
        setIsSaved(previousState);
        console.error("Error during favorite mutation:", err);
      }
    });
  };

  const isFavoriteActive = isSaved;

  return (
    <>
      {variant === "button" || showLabel ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleToggle}
          className={`gap-1.5 transition-all ${
            isFavoriteActive
              ? "border-secondary/50 bg-secondary/10 text-secondary hover:bg-secondary/20"
              : "hover:border-primary/40"
          } ${className}`}
          title={isFavoriteActive ? "Remove from saved" : "Save property"}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          ) : (
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavoriteActive ? "fill-secondary text-secondary" : "text-primary"
              }`}
            />
          )}
          <span>{isFavoriteActive ? "Saved" : "Save"}</span>
        </Button>
      ) : (
        <IconButton
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={isFavoriteActive ? "Remove from saved" : "Save property"}
          variant="ghost"
          size="md"
          className={`bg-surface/80 text-primary backdrop-blur-md hover:bg-surface hover:scale-105 shadow-xs transition-all ${
            isPending ? "opacity-70 cursor-wait" : ""
          } ${className}`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          ) : (
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavoriteActive ? "fill-secondary text-secondary" : "text-primary"
              }`}
            />
          )}
        </IconButton>
      )}

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign in to Save Properties"
        description="Create your personal portfolio to bookmark architectural residences and track availability."
      />
    </>
  );
}
