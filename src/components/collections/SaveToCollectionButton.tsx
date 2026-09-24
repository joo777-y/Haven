"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import SaveToCollectionModal from "./SaveToCollectionModal";

interface SaveToCollectionButtonProps {
  propertyId: string;
  propertyTitle: string;
  variant?: "icon" | "button";
  showLabel?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export default function SaveToCollectionButton({
  propertyId,
  propertyTitle,
  variant = "icon",
  showLabel = false,
  className = "",
  onSuccess,
}: SaveToCollectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      {variant === "button" || showLabel ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          className={`gap-1.5 transition-all hover:border-primary/40 ${className}`}
          title="Save to Collection"
        >
          <FolderPlus className="h-4 w-4 text-secondary shrink-0" />
          <span>Add to Collection</span>
        </Button>
      ) : (
        <IconButton
          type="button"
          onClick={handleClick}
          aria-label={`Save ${propertyTitle} to collection`}
          variant="ghost"
          size="md"
          className={`bg-surface/80 text-primary backdrop-blur-md hover:bg-surface hover:text-secondary hover:scale-105 shadow-xs transition-all ${className}`}
          title="Add to Collection"
        >
          <FolderPlus className="h-4 w-4" />
        </IconButton>
      )}

      <SaveToCollectionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        onSuccess={onSuccess}
      />
    </>
  );
}
