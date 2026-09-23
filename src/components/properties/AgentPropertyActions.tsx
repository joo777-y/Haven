"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Edit3,
  Globe,
  Archive,
  UploadCloud,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { updatePropertyStatusAction } from "@/lib/properties/actions";

interface AgentPropertyActionsProps {
  propertyId: string;
  slug: string;
  status: "draft" | "published" | "archived";
}

export default function AgentPropertyActions({
  propertyId,
  slug,
  status,
}: AgentPropertyActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (
    targetStatus: "draft" | "published" | "archived"
  ) => {
    startTransition(async () => {
      const res = await updatePropertyStatusAction(propertyId, targetStatus);
      if (!res.success) {
        alert(res.error || "Failed to update property status.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Edit Action */}
      <Link href={`/agent/properties/${propertyId}/edit`}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs gap-1.5"
          title="Edit property details"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      </Link>

      {/* Publish Action (from draft or archived) */}
      {(status === "draft" || status === "archived") && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleStatusChange("published")}
          className="h-8 px-2.5 text-xs gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          title="Publish property to the public catalog"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          <span>Publish</span>
        </Button>
      )}

      {/* Archive Action (from published or draft) */}
      {status !== "archived" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => handleStatusChange("archived")}
          className="h-8 px-2.5 text-xs gap-1.5 text-muted hover:text-amber-600 hover:bg-amber-500/10"
          title="Archive property (removes from public catalog)"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
          <span>Archive</span>
        </Button>
      )}

      {/* View Public Page (if published) */}
      {status === "published" && (
        <Link
          href={`/properties/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted hover:text-foreground"
            title="View public page in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}
