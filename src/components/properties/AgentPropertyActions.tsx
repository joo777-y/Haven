"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Edit3,
  Archive,
  UploadCloud,
  ExternalLink,
  Loader2,
  Trash2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  updatePropertyStatusAction,
  deletePropertyAction,
} from "@/lib/properties/actions";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleStatusChange = (
    targetStatus: "draft" | "published" | "archived"
  ) => {
    setStatusError(null);
    startTransition(async () => {
      const res = await updatePropertyStatusAction(propertyId, targetStatus);
      if (!res.success) {
        setStatusError(res.error || "Failed to update property status.");
      }
    });
  };

  const handleDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      const res = await deletePropertyAction(propertyId);
      if (res.success) {
        setIsDeleteModalOpen(false);
      } else {
        setDeleteError(res.error || "Failed to delete property listing.");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
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

        {/* Unpublish to Draft Action (if published) */}
        {status === "published" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => handleStatusChange("draft")}
            className="h-8 px-2.5 text-xs gap-1.5 text-muted hover:text-foreground"
            title="Unpublish and return to draft"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            <span>Unpublish</span>
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

        {/* Delete Trigger */}
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => setIsDeleteModalOpen(true)}
          className="h-8 px-2 text-xs text-muted hover:text-red-600 hover:bg-red-500/10"
          title="Delete listing permanently"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isPending && setIsDeleteModalOpen(false)}
        title="Delete Property Listing"
        description="Are you sure you want to permanently remove this property listing from your portfolio? This action cannot be undone."
        size="md"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-400 space-y-1">
            <p className="font-semibold">Important:</p>
            <p className="leading-relaxed">
              Deleting this listing will automatically remove all attached photography from storage, clear related buyer inquiries, and delete it from user saved portfolios.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Listing</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
      {statusError && (
        <Modal
          isOpen={!!statusError}
          onClose={() => setStatusError(null)}
          title="Listing Publication Notice"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{statusError}</p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusError(null)}
                className="text-xs"
              >
                Understood
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
