import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import Button from "@/components/ui/Button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-divider bg-surface/50 p-8 sm:p-12 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary mb-4 shadow-2xs">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground">
        {title}
      </h3>

      <p className="font-sans text-xs sm:text-sm text-muted max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>

      {(actionLabel && (actionHref || onAction)) && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="outline" size="sm" className="shadow-2xs">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={onAction} className="shadow-2xs">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
